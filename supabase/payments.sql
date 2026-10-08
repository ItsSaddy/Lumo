-- Оплата заказов по Kaspi QR (через ApiPay): статус оплаты у заказа.
-- Выполнить один раз: Supabase → SQL Editor → вставить → Run. Повторный запуск ничего не сломает.
-- Статус ставит вебхук app/api/kaspi/webhook; админка показывает «Оплачен» в списке клиентов.

alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists payment_invoice_id bigint;   -- id счёта в ApiPay, который оплатили
alter table public.orders add column if not exists payment_method text;         -- GOLD / RED / LOAN — чем платил клиент
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists payment_attempts integer not null default 0; -- сколько QR выпущено
