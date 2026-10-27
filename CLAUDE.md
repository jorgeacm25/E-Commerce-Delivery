# CLAUDE.md

Este archivo contiene las reglas permanentes de trabajo para este repositorio.
Cualquier agente o desarrollador (humano o IA) que modifique este proyecto debe
seguirlas. Si una tarea entra en conflicto con una regla, se detiene y se
pregunta antes de continuar.

## Qué es este proyecto

Plataforma de e-commerce para vender alimentos desde el exterior con entrega a
destinatarios en Cuba. Actualmente el repositorio implementa una tienda de
celulares (`celularesbaratos-ecommerce`) adaptada con módulos de pagos,
combos y liquidaciones pensados para el caso de uso de "Delivery Home". El
dominio de producto está migrando de celulares a alimentos/combos; el código
y los nombres de tablas todavía reflejan el origen "celulares" en varios
sitios (ver [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)).

**Importante:** este documento describe el stack **real** detectado en el
repositorio, no una arquitectura ideal. Ver la sección "Nota sobre la
arquitectura" más abajo antes de asumir que el proyecto usa Next.js/Prisma.

## Reglas permanentes

### Idioma
- Documentación, comentarios explicativos y explicaciones al usuario: **español**.
- Código, nombres de variables, funciones, clases, tipos, componentes: **inglés**.

### TypeScript
- Modo estricto siempre activo (`strict: true` ya configurado en `tsconfig.app.json`).
- No usar `any` sin justificación explícita en comentario. Preferir `unknown` +
  narrowing, genéricos, o tipar correctamente la respuesta de Supabase.

### Arquitectura y componentes
- Arquitectura modular por dominios (auth, products, combos, orders, payments,
  inventory, suppliers, sellers, workers, expenses, reports, users/roles...).
- Componentes pequeños, reutilizables, con responsabilidad única.
- Diseño mobile-first y accesible (contraste, foco visible, labels asociados,
  navegación por teclado).

### Seguridad
- No guardar secretos en el repositorio. `.env` debe estar y permanecer en
  `.gitignore` (ya lo está). **Nunca** commitear claves reales en
  `.env.example`, ni siquiera claves "anon/publishable" — usar placeholders.
- Toda regla de autorización sensible debe reforzarse a nivel de base de datos
  (RLS), no solo en el cliente. El cliente puede añadir guardas de UX, pero
  nunca es la única barrera.

### Dinero
- El dinero se maneja con tipos decimales, **nunca float**.
- En PostgreSQL: columnas `numeric`, nunca `float`/`double precision`.
- En TypeScript: no operar montos como `number` de JavaScript en cálculos
  encadenados o acumulativos (comisiones, liquidaciones, totales). Usar una
  librería decimal (p. ej. `decimal.js`) o representar montos en la unidad
  mínima (centavos) como entero cuando se hagan sumas/restas repetidas.
- Conservar siempre el monto y la moneda originales de cada transacción
  (no sobrescribir el valor de origen al convertir a otra moneda).

### Fechas
- Fechas internas (almacenamiento, cálculos, auditoría) siempre en UTC.
- La conversión a zona horaria local es solo de presentación.

### Inventario
- Toda operación de inventario (alta, baja, ajuste, reserva por pedido) debe
  quedar registrada en un histórico auditable (quién, qué, cuánto, cuándo,
  por qué). Un `UPDATE` directo sobre el stock sin registro de movimiento
  no es aceptable a partir de la fase de inventario formal.

### Pagos
- Las operaciones de pago deben ser idempotentes: reintentar la misma
  operación (mismo comprobante, mismo webhook, mismo click duplicado) no debe
  duplicar efectos (no debe crear dos comprobantes, no debe confirmar dos
  veces, no debe generar dos liquidaciones).
- No integrar todavía procesadores de pago reales (Stripe, PayPal API, Zelle
  API, pasarelas cubanas, etc.). Usar un proveedor de pagos simulado/manual
  (el flujo actual de "subir comprobante + verificación manual" cumple ese
  rol) hasta que se apruebe explícitamente integrar uno real.

### Comisiones
- Las comisiones (vendedores, mensajeros, roles de reparto) solo se
  consolidan/liquidan cuando el pedido está **pagado y entregado**. Ningún
  cálculo de comisión debe quedar en firme antes de cumplirse ambas
  condiciones.

### Flujo de trabajo
- Después de cada tarea de código: ejecutar lint, typecheck, pruebas y build
  (ver comandos abajo). No dar una tarea por terminada si alguno falla sin
  que el usuario lo haya aceptado explícitamente.
- Actualizar [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) después de cada
  fase completada.
- No comenzar una nueva fase del [docs/ROADMAP.md](docs/ROADMAP.md) hasta que
  la fase actual esté validada por el usuario.
- No eliminar ni sobrescribir trabajo existente sin confirmar. Si se
  encuentran cambios sin commitear al empezar una tarea, se investigan antes
  de tocarlos.

## Comandos disponibles

Versión de Node: **24 LTS** (fijada en `.nvmrc` y en `engines` de
`package.json`). Con nvm: `nvm use` en la raíz del repo.

Definidos en `package.json` (gestor de paquetes: npm, hay `package-lock.json`):

```bash
npm run dev       # servidor de desarrollo (Vite)
npm run build     # typecheck (tsc -b) + build de producción (vite build)
npm run lint      # ESLint
npm run preview   # sirve el build de producción localmente
```

No existe todavía un script de pruebas (`test`) ni un script `typecheck`
independiente — hoy el typecheck ocurre como parte de `npm run build` (`tsc -b`).
No hay Playwright, Vitest ni React Testing Library instalados aún (ver
[docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) y
[docs/ROADMAP.md](docs/ROADMAP.md)). Hasta que se añadan, "ejecutar pruebas"
significa como mínimo `npm run lint` y `npm run build`.

## Nota sobre la arquitectura

El prompt original de este proyecto asumía Next.js App Router + Prisma +
Auth.js + PostgreSQL directo + Vitest + Playwright + Docker. **El código ya
existente en este repositorio no usa esa pila**: usa Vite + React Router DOM
+ Supabase (que ya provee Postgres, Auth y Storage) + TanStack Query +
Zustand + React Hook Form + Zod + Tailwind. Hay ~2500 líneas de lógica de
negocio funcionando (auth, productos, combos, pedidos, pagos, checkout,
dashboard) sobre esta base.

Por la regla de "no eliminar ni sobrescribir trabajo existente", **no se
reescribió el proyecto a Next.js/Prisma**. Ver
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para el detalle de la
arquitectura real y las opciones a futuro (continuar sobre Supabase vs.
migrar a Next.js/Prisma/Auth.js). Esta decisión debe tomarla el usuario
explícitamente antes de la siguiente fase.

## Estructura real de carpetas

```
src/
  actions/      llamadas directas a Supabase (equivalente a "server actions" pero client-side)
  components/   UI por dominio (checkout, dashboard, home, products, shared...)
  constants/
  data/
  helpers/
  hooks/        hooks de TanStack Query por dominio, envuelven actions/
  interfaces/   tipos de dominio (TypeScript)
  layouts/      RootLayout, ClientLayout (área cliente), DashboardLayout
  lib/          validadores Zod
  pages/
  router/       definición de rutas (react-router-dom)
  store/        estado global (Zustand): carrito, contador, global
  supabase/     cliente de Supabase + tipos generados de la DB
supabase/
  migrations/   SQL versionado del esquema
docs/           documentación de arquitectura, roadmap, estado y modelo de datos
```

La estructura objetivo mencionada en el prompt original
(`src/app`, `src/features`, `src/server`, `src/config`, `src/types`,
`src/mocks`, `prisma`, `tests`) **no existe hoy** y no debe crearse vacía sin
propósito. Se evalúa por fase, según el dominio que se esté construyendo.
