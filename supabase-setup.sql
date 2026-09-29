-- ============================================================
-- JN Mates — Setup de seguridad (RLS) y vista pública
-- Correr esto UNA VEZ en Supabase → SQL Editor → New query
-- ============================================================

-- 1) Columna de costo, para poder calcular ganancia (precio - costo)
--    Si ya existe, esto no hace nada.
alter table productos add column if not exists costo numeric default 0;

-- 2) Vista pública: es lo que va a leer la tienda (app/page.js).
--    NO incluye "costo" ni productos inactivos.
create or replace view productos_publicos as
select
  p.id,
  p.nombre,
  p.precio,
  p.stock,
  p.material,
  p.imagen_url,
  p.categoria_id,
  c.nombre as categoria_nombre
from productos p
left join categorias c on c.id = p.categoria_id
where p.activo = true;

-- 3) Activar RLS en las tablas reales
alter table productos enable row level security;
alter table categorias enable row level security;

-- 4) Limpiar policies viejas (si corriste esto antes, evita duplicados)
drop policy if exists "solo autenticados leen productos" on productos;
drop policy if exists "solo autenticados escriben productos" on productos;
drop policy if exists "solo autenticados actualizan productos" on productos;
drop policy if exists "solo autenticados borran productos" on productos;
drop policy if exists "todos leen categorias" on categorias;
drop policy if exists "autenticados escriben categorias" on categorias;

-- 5) productos: SOLO usuarios logueados (vos y tu pareja) pueden
--    leer/crear/editar/borrar la tabla real (con costo, inactivos, etc.)
create policy "solo autenticados leen productos"
  on productos for select
  to authenticated
  using (true);

create policy "solo autenticados escriben productos"
  on productos for insert
  to authenticated
  with check (true);

create policy "solo autenticados actualizan productos"
  on productos for update
  to authenticated
  using (true) with check (true);

create policy "solo autenticados borran productos"
  on productos for delete
  to authenticated
  using (true);

-- 6) categorias: lectura pública (no es info sensible), escritura solo logueados
create policy "todos leen categorias"
  on categorias for select
  to anon, authenticated
  using (true);

create policy "autenticados escriben categorias"
  on categorias for all
  to authenticated
  using (true) with check (true);

-- 7) Dar acceso de lectura de la VISTA pública al rol anónimo
--    (la vista corre con permisos del dueño, así que esto no expone
--    la tabla real ni la columna costo)
grant select on productos_publicos to anon;

-- ============================================================
-- Después de correr esto:
-- 1. Andá a Authentication → Providers y asegurate que "Allow new
--    users to sign up" esté DESACTIVADO (para que nadie más se cree
--    una cuenta sola).
-- 2. Andá a Authentication → Users → "Add user" y creá 2 usuarios:
--    el tuyo y el de tu pareja (email + contraseña).
-- ============================================================
