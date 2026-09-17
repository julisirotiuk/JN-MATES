# JN Mates — Control de stock

App de gestión de stock, compras y ventas, conectada a Supabase.

---

## 1. Probarla en tu compu

Necesitás tener **Node.js** instalado (si no lo tenés: https://nodejs.org — bajá la versión LTS).

Abrí una terminal en esta carpeta y corré:

```bash
npm install
npm run dev
```

Después entrá a **http://localhost:3000** en el navegador. Ahí ya debería conectarse
a tu Supabase y mostrarte las categorías y productos.

---

## 2. Publicarla en internet (para usarla desde el celular)

La forma más simple es **Vercel** (gratis):

1. Creá una cuenta en https://vercel.com (podés entrar con GitHub).
2. Subí esta carpeta a un repositorio de GitHub (o usá "Deploy" arrastrando la carpeta).
3. En Vercel, importá el proyecto.
4. **Importante:** antes de desplegar, en la sección "Environment Variables" cargá estas dos:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://pipgryexnfgrtnqfqqus.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (la anon key de tu proyecto, está en `.env.local`) |

5. Deploy. Te va a dar un link tipo `jn-mates.vercel.app`.

Ese link lo abrís en el celular → menú del navegador → **"Agregar a pantalla de inicio"**,
y te queda con ícono como si fuera una app.

---

## 3. Estructura del proyecto

```
app/
  page.js          → toda la app (Resumen, Stock, Comprar, Vender)
  layout.js        → configuración general de la página
lib/
  supabaseClient.js → conexión con Supabase
.env.local         → tus claves (NO subir a GitHub público)
```

---

## 4. Pendiente / próximos pasos

- [ ] **Login** (Supabase Auth) para que solo ustedes dos puedan entrar
- [ ] **Reactivar RLS** en Supabase una vez que haya login
      (hoy está desactivado, o sea que cualquiera con la anon key puede escribir)
- [ ] Catálogo público con carrito
- [ ] Checkout con Mercado Pago
- [ ] Descuento automático de stock vía webhook de pago
