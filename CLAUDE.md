# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, eslint-config-next)
```

There is no test suite configured in this repo.

## Architecture

Lumo is a single-tenant e-commerce storefront (Russian-language UI, plant/mushroom extract products) built on Next.js App Router + Supabase. There is no dedicated CMS/admin API — the `app/admin` routes double as the CMS.

**Data layer**: Supabase Postgres, accessed via `@supabase/ssr`. Two client factories:
- [lib/supabase/server.ts](lib/supabase/server.ts) — for Server Components/Actions, backed by `next/headers` cookies.
- [lib/supabase/client.ts](lib/supabase/client.ts) — for Client Components (used only by the login form).

Core tables (inferred from queries, no local schema/migrations in this repo): `products`, `orders`, `order_items` (FK to `products`), plus Supabase Auth for the single admin user. Schema changes must be made directly in the Supabase project.

**Auth**: [middleware.ts](middleware.ts) gates every `/admin/*` route except `/admin/login`, redirecting unauthenticated requests. Each Server Component under `/admin` additionally re-checks `supabase.auth.getUser()` and redirects itself — the middleware isn't relied on as the sole guard.

**Cart**: client-only state in [lib/cart-context.tsx](lib/cart-context.tsx) (`CartProvider`, `useCart`), persisted to `localStorage` under key `lumo-cart`. No server-side cart/session — the cart only becomes a DB row at checkout.

**Discount rule**: [lib/discount.ts](lib/discount.ts)'s `calculateOrderTotals` is the single source of truth for pricing — it expands cart lines into individual units, sorts by price descending, and applies 50% off every second-most-expensive unit (i.e., globally across the cart, not per product pair). Both [lib/cart-context.tsx](lib/cart-context.tsx) (for display) and [app/checkout/actions.ts](app/checkout/actions.ts) (for the stored `total_price`) call this function — keep them in sync if the discount logic changes.

**Checkout flow**: [app/checkout/actions.ts](app/checkout/actions.ts) (`submitOrder`, a Server Action) writes an `orders` row + `order_items` rows, then best-effort notifies a Telegram chat via bot API (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` — silently skipped if unset). There is no payment integration; checkout only collects contact/shipping info and creates a pending order for manual follow-up.

**Admin**: [app/admin/actions.ts](app/admin/actions.ts) has the product CRUD Server Actions (`addProduct`/`updateProduct`/`deleteProduct`), each re-checking auth and calling `revalidatePath('/admin')` + `revalidatePath('/')` after writes. [app/admin/clients](app/admin/clients/page.tsx) lists submitted orders with their line items via a nested Supabase select.

**Styling**: Tailwind v4 (CSS-based config via `@theme inline` in [app/globals.css](app/globals.css), no `tailwind.config.*`). Custom semantic color tokens: `ink`, `stone`, `brass`, `plum`, `paper`, `mist` — reuse these rather than raw Tailwind palette colors. Fonts are `next/font/google` (Playfair Display → `--font-display`, Manrope → `--font-sans`), wired up in [app/layout.tsx](app/layout.tsx).

## Environment variables

Required in `.env.local` (not committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
