# Arquitectura

> Este documento describe la arquitectura **realmente presente** en el
> repositorio a fecha 2026-07-30, no una arquitectura deseada. Para las
> reglas permanentes ver [../CLAUDE.md](../CLAUDE.md). Para el estado de
> avance ver [PROJECT_STATE.md](PROJECT_STATE.md).

## Stack detectado

| Capa | Tecnología | Versión (package.json) |
|---|---|---|
| Build tool | Vite (plugin react-swc) | ^5.4.1 |
| UI | React | ^18.3.1 |
| Enrutamiento | react-router-dom (`createBrowserRouter`) | ^6.26.2 |
| Server state | @tanstack/react-query | ^5.55.4 |
| Client state | zustand | ^4.5.5 |
| Formularios | react-hook-form + @hookform/resolvers | ^7.53.0 |
| Validación | zod | ^3.23.8 |
| Backend as a Service | @supabase/supabase-js (Postgres + Auth + Storage) | ^2.45.4 |
| Estilos | Tailwind CSS + @tailwindcss/typography | ^3.4.10 |
| Editor de texto enriquecido | @tiptap/react + starter-kit | ^2.6.6 |
| Notificaciones UI | react-hot-toast | ^2.4.1 |
| Lenguaje | TypeScript (strict) | ^5.5.3 |
| Lint | ESLint 9 (flat config) + typescript-eslint | ^9.9.0 |

**No** hay Next.js, Prisma, Auth.js, Docker, Vitest, React Testing Library ni
Playwright instalados. No hay backend propio (Node/Express/servidor
custom): toda la lógica de "servidor" vive en Postgres (RLS, constraints) y
se invoca directamente desde el navegador vía `@supabase/supabase-js`.

## Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│ pages/            (una página por ruta, arma el layout)  │
├─────────────────────────────────────────────────────────┤
│ components/<domain>/  (UI, reciben props, sin fetch)      │
├─────────────────────────────────────────────────────────┤
│ hooks/<domain>/   (useQuery / useMutation de TanStack)    │
├─────────────────────────────────────────────────────────┤
│ actions/<domain>.ts  (llamadas directas a supabase-js:    │
│                        select/insert/update/storage)      │
├─────────────────────────────────────────────────────────┤
│ supabase/client.ts  (cliente único, o cliente "offline"   │
│                       simulado si faltan env vars)        │
├─────────────────────────────────────────────────────────┤
│ Supabase (Postgres + RLS + Auth + Storage)                │
│   supabase/migrations/*.sql  (esquema versionado)         │
└─────────────────────────────────────────────────────────┘
```

`actions/*.ts` cumple el rol que en Next.js cumplirían las Server Actions o
las rutas de API: es donde se concentra el acceso a datos. La diferencia
clave es que aquí se ejecuta **en el navegador**, no en un servidor de
confianza — por eso la autorización real recae en las políticas RLS de
Postgres, no en el código de `actions/`.

## Módulos de dominio existentes

- **auth** (`actions/auth.ts`, `hooks/auth/*`): registro, login, sesión,
  asignación de rol `customer` por defecto en `user_roles`.
- **products** (`actions/product.ts`, `hooks/products/*`,
  `components/dashboard/products/*`): CRUD de productos y variantes,
  subida de imágenes, editor de descripción (Tiptap).
- **combos** (`actions/combo.ts`, `hooks/combos/*`): combos de variantes con
  precio propio en USD.
- **orders** (`actions/order.ts`, `hooks/orders/*`): creación de pedido,
  descuento de stock, consulta de pedidos propios y de administración.
- **payments** (`actions/payment.ts`, `hooks/payments/*`,
  `components/dashboard/payments/*`, `components/checkout/PaymentProofUpload.tsx`):
  cuentas de cobro (Zelle/PayPal), tasa de cambio USD→CUP, subida y
  verificación manual de comprobantes de pago.
- **checkout** (`components/checkout/*`, `pages/CheckoutPage.tsx`): dirección
  de envío, resumen del carrito, subida de comprobante.
- **dashboard/CRM básico** (`layouts/DashboardLayout.tsx`,
  `components/dashboard/*`): panel de administración con productos, pedidos,
  pagos y combos.

## Módulos de dominio pendientes (declarados en el objetivo del negocio, aún sin código)

Inventario/almacenes formal (más allá del campo `stock` en `variants`),
proveedores y compras, vendedores y comisiones (existe la tabla
`delivery_roles`/`liquidations` en SQL pero sin `actions`/`hooks`/UI),
trabajadores y nómina, gastos/pagos/contabilidad, reportes, gestión granular
de usuarios/roles/permisos, auditoría transversal. Ver
[ROADMAP.md](ROADMAP.md) y [DATA_MODEL_DRAFT.md](DATA_MODEL_DRAFT.md).

## Autenticación y autorización

- Supabase Auth maneja sesión (JWT) y `auth.users`.
- Rol de negocio vive en tabla propia `user_roles` (`admin`, `customer`,
  `operador`, `mensajero`), **no** en metadata de Auth.
- La autorización real está en las políticas RLS de cada tabla
  (`supabase/migrations/*.sql`): lectura pública de catálogo, cliente ve
  solo lo suyo, admin tiene acceso total vía `exists (... user_roles ...)`.
- **Gap detectado:** `DashboardLayout` no verifica el rol del usuario antes
  de renderizar el panel de administración (ver
  [PROJECT_STATE.md](PROJECT_STATE.md) → Riesgos). RLS evita la fuga de
  datos, pero no evita que un usuario no admin entre a la UI y vea un panel
  roto/vacío. Se debe añadir una guarda de ruta client-side antes de sumar
  más superficie a `/dashboard`.

## Dinero y moneda

- Postgres usa `numeric` (correcto, sin float) en `price`, `total_amount`,
  `total_cup`, `precio_combo_usd`, `valor_cup_por_usd`, `monto_calculado`.
- El pedido conserva `currency` + `total_amount` (USD) + `total_cup` +
  `exchange_rate_id`: sí se preserva el monto y la tasa originales.
- **Gap detectado:** en la capa TypeScript estos valores se tipan y usan como
  `number` de JavaScript (`src/interfaces/*.ts`, `helpers/index.ts` con
  `usd * valorCupPorUsd`). Esto es aceptable para mostrar un total simple,
  pero no debe usarse para sumas acumulativas de comisiones/liquidaciones
  sin pasar por una librería decimal, por el riesgo de errores de
  redondeo en operaciones encadenadas.

## Inventario

- Hoy el stock es un entero por variante (`variants.stock`), decrementado
  con un `select` + `update` secuencial en `actions/order.ts::createOrder`
  (líneas ~28-46 y ~103-130).
- **Gap detectado:** esa operación no es atómica (no usa una función
  transaccional/RPC de Postgres) ni queda registrada en un histórico. Dos
  compras simultáneas de la última unidad pueden generar sobreventa (race
  condition), y no hay forma de auditar quién/cuándo/por qué cambió el
  stock. Corregir antes o durante la fase de inventario formal.

## Pagos

- El "proveedor de pagos" actual es 100% manual/simulado: el cliente sube
  una imagen de comprobante, un operador confirma o rechaza manualmente
  (`actions/payment.ts`). Cumple la regla de no integrar procesadores
  reales todavía.
- **Gap detectado:** ninguna de las mutaciones de pago
  (`uploadPaymentProof`, `confirmPaymentProof`, `rejectPaymentProof`) usa
  una clave de idempotencia; un doble clic o un reintento de red podría
  crear dos comprobantes o notificar dos veces. No es crítico mientras el
  volumen es bajo y la verificación es manual, pero debe resolverse antes
  de automatizar cualquier parte del flujo.

## Opciones a futuro (requieren decisión explícita del usuario)

1. **Continuar sobre Vite + Supabase** (recomendado dado el trabajo ya
   invertido): añadir lo que falta (guarda de rol, RPC transaccional de
   stock, tabla de auditoría, tests) sin migrar de framework.
2. **Migrar a Next.js App Router + Prisma + Auth.js**: alinea con el prompt
   original y facilita lógica de servidor "de verdad" (webhooks de pago,
   jobs de liquidación), pero implica reescribir toda la capa de datos y
   de rutas ya funcional. Alto costo, no se debe iniciar sin acuerdo
   explícito.

Este documento no toma la decisión; la registra como pendiente en
[ROADMAP.md](ROADMAP.md).
