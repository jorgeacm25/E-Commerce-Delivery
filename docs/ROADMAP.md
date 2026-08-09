# Roadmap

> Orden de fases. Regla permanente: **no se empieza una fase nueva sin que
> el usuario valide la anterior** (ver [../CLAUDE.md](../CLAUDE.md)). Cada
> fase termina con lint + typecheck + pruebas + build en verde y con
> [PROJECT_STATE.md](PROJECT_STATE.md) actualizado.
>
> **2026-07-30 — Roadmap reemplazado.** El usuario entregó un spec de
> negocio completo (páginas públicas, panel admin único, reglas de
> precio/comisión/deuda, datos de prueba) que sustituye la planificación
> anterior (fases 1-8 orientadas a "endurecer y luego construir"). Este
> roadmap prioriza en su lugar completar la superficie de negocio pedida,
> con datos **mock** (no Supabase real, salvo lo que ya estaba conectado:
> tasa de cambio). La deuda técnica heredada no se pierde — se reordena al
> final (ver "Deuda técnica" abajo) en vez de bloquear el resto.

## Fase -1 — Decisión de arquitectura (resuelta)

Se confirmó continuar sobre Vite + React Router + Supabase (no migrar a
Next.js/Prisma). Ver [ARCHITECTURE.md](ARCHITECTURE.md).

## Fase 0 — Base ya completada

- Tienda pública: catálogo, ficha de producto, combos, carrito, checkout
  (simulado), confirmación de pedido, rastreo.
- Sistema de diseño (`src/components/ui/`, 31 componentes).
- Autenticación de clientes (registro/login) + rol por defecto `customer`.
- Dashboard admin básico (legacy, parcialmente reconectado).
- Tasa de cambio USD/CUP real en Supabase (`exchange_rates`).
- Esquema SQL versionado en `supabase/migrations/` con RLS activo.

## Fase A — Tienda pública ajustada a las decisiones de negocio (completada)

Objetivo: la tienda pública (sin login) muestra precios **solo en USD**
(conversión a CUP queda interna, para el panel admin) y el catálogo mock
cubre las categorías de una agencia de delivery a Cuba (Carnes, Aseo,
Bebidas, Dulces, y las ya existentes Despensa/Congelados/Combos
familiares).

1. `CurrencyDisplay` deja de mostrar CUP; se retira el selector de moneda
   del header (decorativo/desconectado) y los copys que mencionaban CUP al
   cliente.
2. Catálogo mock ampliado: categoría "Dulces" (4 productos) y un 5to combo
   (`combo-dulce-merienda`), sobre `src/data/catalog.mock.ts`.
3. Rutas públicas confirmadas tal como ya estaban construidas:
   `/`, `/catalogo`, `/categoria/:slug`, `/producto/:slug` (sirve también
   combos vía `isCombo`), `/combos`, `/carrito`, `/checkout`,
   `/pedido-confirmado/:orderNumber`, `/rastrear-pedido`. No se creó una
   ruta `/combo/:id` separada (el spec original la sugería, pero duplicaría
   la UI ya construida en `/producto/:slug`).

## Fase A.1 — Área privada del cliente (completada, adelantada fuera de orden)

> Insertada el 2026-07-30 por instrucción explícita del usuario, antes de
> la Fase B (panel admin) que este roadmap tenía como "siguiente". Ver
> [PROJECT_STATE.md](PROJECT_STATE.md), sección "Área privada del cliente"
> para el detalle completo.

`/mi-cuenta` (perfil, destinatarios, direcciones, pedidos + detalle,
favoritos, seguridad, soporte, logout) conectado a Supabase real con RLS
(migración `005_customer_account.sql`: `customer_addresses`,
`customer_recipients`, `favorites`, `support_cases`, todas ligadas a
`profiles`). Excepción documentada: los pedidos siguen sobre el checkout
simulado (localStorage etiquetado por `userId`) porque no existe todavía
una tabla `orders` real para el dominio de comida — mismo gap que el
riesgo 12 de `PROJECT_STATE.md`; se resuelve cuando se conecte el checkout
real, no en esta fase.

## Fase B — Panel admin: acceso y núcleo (productos, combos, pedidos)

> **2026-07-31 — Construida y con backend real aplicado; pendiente de
> prueba del usuario.** Ver `docs/PROJECT_STATE.md`, sección "Panel admin —
> Fase B", para el detalle completo. Las migraciones `006`-`008` (fix de
> RLS `is_staff()`, tablas `catalog_*`, `combo_items.catalog_variant_id`)
> ya se aplicaron al proyecto Supabase real, a petición explícita del
> usuario. **Todavía no se marca como completada** en el sentido de la
> regla de `CLAUDE.md` (no empezar una fase nueva sin validar la anterior):
> falta que el usuario pruebe el flujo completo con datos reales
> (crear categoría → producto → combo → ver pedido) con una sesión
> `admin`/`operador` real en el navegador. **No iniciar la Fase C hasta que
> el usuario confirme que la Fase B queda validada.**

- Guarda de rol en `/admin` (`admin`/`operador`, vía `profiles.role` +
  `src/lib/roleGuards.ts` + `RequireAuth allowedRoles`) — no se creó un
  login dedicado nuevo, se sigue reusando `/iniciar-sesion`.
- `/admin` (Dashboard): stats reales (pedidos de hoy, ventas del mes,
  ticket promedio, tasa de cambio vigente) + stats simuladas marcadas
  "Próximamente" para Fases C-I (stock bajo, vencimientos, entregas,
  comisiones, nómina, gastos) + actividad reciente (mock).
- `/admin/pedidos` (+ `/admin/pedidos/pagos` verificación de pagos,
  `/admin/pedidos/:id` detalle): reconexión del CRUD legacy
  (`src/actions/order.ts`, `src/actions/payment.ts`) a la nueva estructura
  de rutas y diseño, con paginación/filtro/búsqueda nuevos. Cambios de
  estado sensibles piden confirmación.
- `/admin/productos` (+ `/nuevo`, `/:id/editar`) y `/admin/categorias`:
  CRUD nuevo (no reconexión — el legacy operaba sobre el esquema
  "celulares") sobre tablas nuevas del dominio comida
  (`catalog_categories`/`catalog_products`/`catalog_product_variants`,
  `supabase/migrations/007_catalog_admin.sql`), con RHF + Zod, subida de
  imágenes, variantes/presentaciones, y el checkbox "calcular automático"
  (precio = costo CUP / tasa vigente + margen USD fijo, fórmula confirmada
  con el usuario) reutilizando `useActiveExchangeRate`.
- `/admin/combos`: reconexión + adaptación (`src/actions/combo.ts`) para
  armar combos con el catálogo nuevo (`supabase/migrations/008_combo_items_catalog_variants.sql`).
- Hallazgo bloqueante corregido (migración redactada, no aplicada): las
  políticas RLS de `orders`/`combos`/`combo_items`/`payment_proofs`/
  `payment_accounts`/`exchange_rates` revisaban `user_roles` (nunca
  poblada por el flujo de registro conectado) en vez de `profiles` —
  `supabase/migrations/006_fix_legacy_admin_rls.sql`.

## Fases C-I — Almacén, Clientes, Vendedores, Trabajadores, Remesas, Contabilidad, Configuración

> **2026-08-09 — Construidas contra el backend .NET real (no mock como
> preveía el plan original de este roadmap), con CRUD completo y pruebas
> de Vitest.** Ver `docs/PROJECT_STATE.md`, entrada "Última actualización",
> para el detalle de qué se cerró. **Pendiente de validación explícita del
> usuario en el navegador** (mismo requisito que quedó abierto para la
> Fase B) antes de considerar todo el bloque B-I cerrado según la regla de
> `CLAUDE.md`. Un ítem queda fuera, diferido a propósito: Dashboard →
> actividad reciente (necesita endpoint de auditoría). Configuración →
> datos de contacto (WhatsApp) se cerró el 2026-08-09 (ver
> `docs/PROJECT_STATE.md`): `api/agencyContact` real en el backend.

- `/admin/almacen` (Fase C): alertas de stock bajo/vencimiento derivadas de
  `GET /api/product`, historial real vía `GET /api/history`, registrar
  salida de producto (`POST /api/productOut`).
- `/admin/clientes` (Fase D): listado con deuda pendiente derivada de
  pedidos `Pending` (`GET /api/customer` + `GET /api/order`), editar
  (nombre/teléfono/contraseña) y eliminar contra `PUT`/`DELETE
  /api/customer`.
- `/admin/vendedores` (Fase E): CRUD + comisión pendiente/liquidar contra
  `api/seller`/`api/commission`. La comisión se liquida vía
  `POST /api/commission/{sellerId}/settle`, disparado solo desde este
  botón — se sigue respetando la regla de CLAUDE.md de no consolidar
  comisiones fuera de pedido pagado y entregado (validación en backend).
- `/admin/trabajadores` (Fase F): mismo patrón que Vendedores sobre
  `api/worker`.
- `/admin/remesas` (Fase G): CRUD + cambio de estado (Pending/Sent/
  Delivered) contra `api/remittance`.
- `/admin/contabilidad` (Fase H): libro contable agregando 4 fuentes reales
  (`api/order`, `api/commission` liquidadas, `api/remittance`,
  `api/expense`); gastos con CRUD completo (crear/editar/eliminar), el
  resto de movimientos son vistas derivadas, no editables.
- `/admin/configuracion` (Fase I): tasa de cambio real (ya existía);
  gestión de cuentas Admin/staff (crear, restablecer contraseña, eliminar
  — el backend no permite renombrar en el Update, solo reset de password);
  datos de contacto (WhatsApp) real vía `api/agencyContact`, mismo patrón
  versionado que la tasa de cambio — reemplaza el valor hardcoded que
  usaban el footer y el botón de WhatsApp de la tienda pública.

## Deuda técnica (heredada, no bloquea las fases de negocio)

Ítems ya detectados en el código actual, pendientes de una ventana de
tiempo dedicada — no se resuelven "de paso" dentro de una fase de negocio
salvo que la toquen directamente:

1. Descuento de stock no atómico en `createOrder` (`src/actions/order.ts`)
   — riesgo de sobreventa por condición de carrera. Mover a una función
   transaccional (RPC) de Postgres.
2. Sin auditoría real de movimientos de inventario en el flujo Supabase
   (la Fase C cubre esto para el catálogo mock, pero el `createOrder` legacy
   sigue sin registrar histórico).
3. Guarda de rol admin vs. cliente en el cliente (`RequireAuth` solo exige
   sesión, no rol) — RLS es la barrera real hoy.
4. Pagos no idempotentes (`uploadPaymentProof`, `confirmPaymentProof`,
   `rejectPaymentProof` en `src/actions/payment.ts`).
5. Dinero como `number` de JS fuera del carrito (`OrderInput`,
   `PaymentProofWithOrder`, combos, comisiones/liquidaciones futuras) — el
   carrito ya usa `decimal.js`, el resto no.
6. `.env.example` con credenciales reales de Supabase (reemplazar por
   placeholders) y `*.tsbuildinfo` sin `.gitignore`.
7. Naming heredado del dominio "celulares" (`CellPhonesPage`, bucket
   `product-images`, etc.).
8. Sin CI (GitHub Actions) ni Playwright; Vitest + Testing Library ya están
   instalados y en uso parcial.

## Infraestructura transversal (a intercalar según necesidad)

- Ampliar Vitest + React Testing Library a los nuevos servicios/hooks mock
  de cada fase de negocio, siguiendo el patrón ya usado en
  `src/store/__tests__/cart.store.test.ts` y
  `src/services/__tests__/catalog.service.test.ts`.
- CI y contenerización: sin decisión tomada todavía, no es bloqueante para
  las fases B-I (todas mock-first).
