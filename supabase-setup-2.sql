-- ============================================================
-- JN Mates — Parte 2: ventas, compras, gastos
-- Correr DESPUÉS del supabase-setup.sql que ya corriste.
-- No pisa nada de lo anterior, solo agrega.
-- ============================================================

-- 1) VENTAS: cada venta registrada (web o en persona)
create table if not exists ventas (
  id bigint generated always as identity primary key,
  producto_id bigint references productos(id) on delete set null,
  producto_nombre text not null,        -- copia del nombre al momento de la venta
  cantidad integer not null,
  precio_unitario numeric not null default 0,
  comprador text,                        -- opcional: nombre/alias de quien compró
  medio_pago text not null,              -- 'efectivo' | 'transferencia_juli' | 'transferencia_nacho'
  tipo_venta text not null default 'persona', -- 'web' | 'persona'
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- 2) COMPRAS: reposición de stock
create table if not exists compras (
  id bigint generated always as identity primary key,
  producto_id bigint references productos(id) on delete set null,
  producto_nombre text not null,
  cantidad integer not null,
  costo_unitario numeric not null default 0,
  medio_pago text,                       -- con qué se pagó la compra (opcional)
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- 3) GASTOS: gastos particulares del negocio (no ligados a un producto)
create table if not exists gastos (
  id bigint generated always as identity primary key,
  descripcion text not null,
  monto numeric not null default 0,
  medio_pago text,                       -- 'efectivo' | 'transferencia_juli' | 'transferencia_nacho'
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- 4) RLS: solo vos y tu pareja pueden ver/cargar esto (es info del negocio)
alter table ventas enable row level security;
alter table compras enable row level security;
alter table gastos enable row level security;

drop policy if exists "autenticados manejan ventas" on ventas;
drop policy if exists "autenticados manejan compras" on compras;
drop policy if exists "autenticados manejan gastos" on gastos;

create policy "autenticados manejan ventas"
  on ventas for all to authenticated using (true) with check (true);

create policy "autenticados manejan compras"
  on compras for all to authenticated using (true) with check (true);

create policy "autenticados manejan gastos"
  on gastos for all to authenticated using (true) with check (true);

-- ============================================================
-- Nota: cuando el checkout de la tienda pública esté listo (con
-- Mercado Pago), vamos a agregar una policy aparte para que ESE
-- proceso pueda insertar ventas tipo 'web' sin necesitar tu login.
-- Por ahora todo se carga a mano desde el panel.
-- ============================================================
