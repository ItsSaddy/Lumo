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

Core tables (inferred from queries, no migrations in this repo): `products`, `orders`, `order_items` (FK to `products`), `site_settings`, plus Supabase Auth for the single admin user. Schema changes must be made directly in the Supabase project (SQL Editor); one-off scripts live in [supabase/](supabase/) — e.g. [supabase/bundles.sql](supabase/bundles.sql) adds `products.bundle` and seeds the starter sets.

**Auth**: [proxy.ts](proxy.ts) (Next 16's renamed middleware) gates every `/admin/*` route except `/admin/login`, redirecting unauthenticated requests. Each Server Component under `/admin` additionally re-checks `supabase.auth.getUser()` and redirects itself — the proxy isn't relied on as the sole guard.

**Cart**: client-only state in [lib/cart-context.tsx](lib/cart-context.tsx) (`CartProvider`, `useCart`), persisted to `localStorage` under key `lumo-cart`. No server-side cart/session — the cart only becomes a DB row at checkout.

**Pricing**: [lib/discount.ts](lib/discount.ts)'s `calculateOrderTotals` is the single place cart totals are computed (currently a plain sum — the old cart-wide discount was removed; savings now come from bundles). Both [lib/cart-context.tsx](lib/cart-context.tsx) (display) and [app/checkout/actions.ts](app/checkout/actions.ts) (stored `total_price`) call it — keep them in sync. Show prices via `formatPrice` from [lib/format.ts](lib/format.ts) (deterministic digit grouping, safe for hydration).

**Bundles (наборы/комбо)**: a bundle is a regular `products` row with `category = 'Наборы'` and its composition in the `bundle` jsonb column (`{ items: [{ product_id, variant?, quantity, gift? }], badge? }`); `spec` holds the course length («30 дней»). Logic is in [lib/bundles.ts](lib/bundles.ts) (`isBundle`, `resolveBundle` → lines, crossed-out sum, savings, discount %). Because bundles are products, `order_items` reference them like any product. The home page ([app/page.tsx](app/page.tsx)) shows bundles first via [components/BundleCard.tsx](components/BundleCard.tsx) (falls back to the plain catalog when no bundles exist); single products live on [app/shop/page.tsx](app/shop/page.tsx). In admin, choosing category «Наборы» reveals the composition constructor ([app/admin/BundleFields.tsx](app/admin/BundleFields.tsx)); `bundle` is only sent for bundles so regular saves work even without the column.

**Cards**: storefront cards are compact [components/ProductTile.tsx](components/ProductTile.tsx) (photo, name, price — the whole tile is a button); everything else (description, variants, bundle composition, add-to-cart) lives in the controlled [components/ProductDialog.tsx](components/ProductDialog.tsx) (`open`/`onClose`), used by both `CatalogGrid` and `BundleCard`.

**Variants**: hardcoded in [lib/product-info.ts](lib/product-info.ts) by category — capsule sizes (60/120, own prices) and pouch flavors (own photos from `public/flavors/`, `comingSoon` ones show «Скоро в наличии» instead of the cart button). Cart line id is `${productId}:${variantKey}`; the variant is not stored in `order_items` (only in the line name / Telegram text).

**Checkout flow**: [app/checkout/actions.ts](app/checkout/actions.ts) (`submitOrder`, a Server Action) writes an `orders` row + `order_items` rows, then best-effort notifies a Telegram chat via bot API (`sendTelegram` in [lib/telegram.ts](lib/telegram.ts); `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` — silently skipped if unset). `submitOrder` re-checks every cart price against `products` (+ variant prices from `getProductVariants`) — cart prices come from `localStorage` and the order total is what gets charged.

**Kaspi QR payment** (optional, via the ApiPay.kz intermediary — no direct Kaspi API): after `submitOrder`, `createOrderQr` issues a QR invoice for the order's DB total ([lib/kaspi.ts](lib/kaspi.ts)); [components/KaspiPayment.tsx](components/KaspiPayment.tsx) shows the QR (valid only minutes — `qr_expires_at`), a deep link for phones, and polls `getOrderPaymentStatus`. The order is marked paid **only** by the signed webhook [app/api/kaspi/webhook/route.ts](app/api/kaspi/webhook/route.ts) (matched via `external_order_id` = order id; a second paid QR for the same order triggers a refund warning in Telegram). DB access there uses the secret-key client [lib/supabase/admin.ts](lib/supabase/admin.ts). Columns come from [supabase/payments.sql](supabase/payments.sql). If `APIPAY_*`/`SUPABASE_SECRET_KEY` are unset, checkout falls back to «Заявка отправлена» (manual follow-up).

**Consultation requests**: [components/ConsultationSection.tsx](components/ConsultationSection.tsx) (home `#consultation` and `/shop`) posts to [app/consultation/actions.ts](app/consultation/actions.ts). Unlike orders, these are **not stored in the DB** — Telegram is the only sink, so the action returns an error (asking to use WhatsApp) when the message can't be sent. A hidden `website` honeypot field drops bot submissions.

**Contacts & documents**: phone/WhatsApp, optional email/Instagram (render only when non-empty) and company details live in [lib/contacts.ts](lib/contacts.ts), used by the footer and the legal pages `/privacy`, `/consent`, `/terms` (shared [components/LegalPage.tsx](components/LegalPage.tsx), common strings in [lib/legal.ts](lib/legal.ts) — bump `LEGAL_UPDATED` when texts change).

**Admin**: [app/admin/actions.ts](app/admin/actions.ts) has the product CRUD Server Actions (`addProduct`/`updateProduct`/`deleteProduct`/`moveProduct`), each re-checking auth and revalidating `/admin`, `/` and `/shop` after writes. Bundles and regular products are listed (and reordered) as separate groups. [app/admin/clients](app/admin/clients/page.tsx) lists submitted orders with their line items (bundle composition expanded) via a nested Supabase select.

**Styling**: Tailwind v4 (CSS-based config via `@theme inline` in [app/globals.css](app/globals.css), no `tailwind.config.*`). Custom semantic color tokens: `ink`, `stone`, `brass`, `plum`, `paper`, `mist` — reuse these rather than raw Tailwind palette colors. Fonts are `next/font/google` (Unbounded → `--font-display`, Manrope → `--font-sans`, Golos Text → `--font-price`; only the weights actually used are loaded), wired up in [app/layout.tsx](app/layout.tsx).

## Environment variables

Required in `.env.local` (not committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

Optional, enable Kaspi QR payment: `APIPAY_API_KEY`, `APIPAY_WEBHOOK_SECRET` (ApiPay cabinet; webhook URL `https://www.health-lumo.org/api/kaspi/webhook`), `SUPABASE_SECRET_KEY` (server-only, bypasses RLS).
