-- Наборы (комбо) LUMO: колонка состава + 4 стартовых набора.
-- Выполнить один раз: Supabase → SQL Editor → вставить → Run. Повторный запуск дублей не создаст.
-- Дальше наборы правятся в админке: категория «Наборы» → блок «Состав набора».

alter table public.products add column if not exists bundle jsonb;

-- product_id — товары из каталога:
--   5b4a6b36-… ЕЖОВИК ГРЕБЕНЧАТЫЙ (жидкий экстракт, 37 500 ₸)
--   9617fe74-… КОРДИЦЕПС ВОЕННЫЙ (жидкий экстракт, 37 500 ₸)
--   b48c4843-… КАПСУЛЫ ЕЖОВИКА (фасовка 60 шт — 8 000 ₸, 120 шт — 16 000 ₸)
insert into public.products (name, description, price, category, spec, image_url, is_available, sort_order, bundle)
select v.name, v.description, v.price, 'Наборы', v.spec, v.image_url, true, v.sort_order, v.bundle::jsonb
from (values
  (
    'Ясный ум',
    'Жидкий экстракт ежовика под язык и капсулы для ежедневного приёма — месяц поддержки памяти, фокуса и спокойного сна.',
    35900, '30 дней', '/bundles/clear-mind.jpg', 101,
    '{"items":[
      {"product_id":"5b4a6b36-2932-4dc6-a996-271708d301d2","quantity":1},
      {"product_id":"b48c4843-d65d-4782-9a85-0fb52b152574","variant":"60","quantity":1}
    ]}'
  ),
  (
    'Ум и Тело',
    'Ежовик отвечает за мозг, кордицепс — за энергию тела. Самое популярное сочетание на месяц, а капсулы ежовика — в подарок.',
    75000, '30 дней', '/bundles/mind-body.jpg', 102,
    '{"badge":"Хит продаж","items":[
      {"product_id":"5b4a6b36-2932-4dc6-a996-271708d301d2","quantity":1},
      {"product_id":"9617fe74-b157-49d4-9c07-6872f9055f42","quantity":1},
      {"product_id":"b48c4843-d65d-4782-9a85-0fb52b152574","variant":"60","quantity":1,"gift":true}
    ]}'
  ),
  (
    'Полный курс «Ясный ум»',
    'Три месяца — срок, за который эффект ежовика накапливается и закрепляется. Экстракт и капсулы на весь курс со скидкой 30%.',
    112350, '3 месяца', null, 103,
    '{"items":[
      {"product_id":"5b4a6b36-2932-4dc6-a996-271708d301d2","quantity":3},
      {"product_id":"b48c4843-d65d-4782-9a85-0fb52b152574","variant":"120","quantity":3}
    ]}'
  ),
  (
    'Полный курс «Ум и Тело»',
    'Три флакона ежовика и три кордицепса — максимальный результат для ума и тела на три месяца со скидкой 30%.',
    157500, '3 месяца', null, 104,
    '{"items":[
      {"product_id":"5b4a6b36-2932-4dc6-a996-271708d301d2","quantity":3},
      {"product_id":"9617fe74-b157-49d4-9c07-6872f9055f42","quantity":3}
    ]}'
  )
) as v(name, description, price, spec, image_url, sort_order, bundle)
where not exists (
  select 1 from public.products p where p.category = 'Наборы' and p.name = v.name
);
