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

## Fase B — Panel admin: acceso y núcleo (productos, combos, pedidos)

- Login simple de administrador en `/admin/login` (hoy se reusa
  `/iniciar-sesion`; falta una entrada dedicada o guarda de rol).
- `/admin/dashboard`: resumen del día (pedidos nuevos, ventas USD, saldo
  estimado CUP/USD, tasa de cambio vigente) — hoy `AdminOverviewPage` es
  puro placeholder con ceros.
- `/admin/pedidos`, `/admin/productos`, `/admin/combos`: reconectar/ampliar
  el CRUD ya existente (legacy en `src/pages/dashboard/*`, no enlazado) a
  la nueva estructura de rutas, con datos mock donde no haya tabla
  Supabase todavía.
- Formulario de producto con checkbox "calcular automático" (precio =
  costo CUP × tasa vigente + margen) vs precio fijo en USD, reutilizando
  `useActiveExchangeRate`/`convertUsdToCup`.

## Fase C — Almacén

- `/admin/almacen`: historial de entradas/salidas de inventario (mock),
  alerta de stock bajo. Modelo `MovimientoAlmacen` — un registro por
  producto por pedido confirmado (incluyendo productos dentro de combos).

## Fase D — Clientes

- `/admin/clientes`: listado, deuda CUP/USD (`deudaUSD`/`deudaCUP`),
  historial de pedidos por cliente. Se alimenta de pedidos con
  `estadoPago: 'pendiente' | 'parcial'`.

## Fase E — Vendedores y comisiones

- `/admin/vendedores`: listado, `comisionPendienteUSD`, botón "liquidar".
- Regla de negocio: `gananciaVendedorUSD` se calcula automáticamente
  (porcentaje configurable) cuando el pedido tiene `vendedorId`, y se
  acumula hasta liquidar. La comisión solo se consolida cuando el pedido
  está pagado **y** entregado (ver [CLAUDE.md](../CLAUDE.md)).

## Fase F — Trabajadores (repartidores)

- `/admin/trabajadores`: listado, pagos pendientes, botón "liquidar".
  Mismo mecanismo de liquidación que vendedores, aplicado a reparto.

## Fase G — Remesas

- `/admin/remesas`: gestión de envíos de remesas (CUP/USD), estado de pago.

## Fase H — Contabilidad

- `/admin/contabilidad`: libro contable con movimientos CUP y USD, filtro
  por fecha y tipo. Consolida ventas, comisiones liquidadas, remesas y
  gastos.

## Fase I — Configuración

- `/admin/configuracion`: editar tasa de cambio (ya real, vía
  `createExchangeRate`/`getActiveExchangeRate`) y datos de contacto de la
  agencia (mock, sin tabla propia todavía).

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
