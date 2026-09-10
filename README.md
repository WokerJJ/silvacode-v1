# SilvaCode

[![CI](https://github.com/WokerJJ/silvacode-v1/actions/workflows/ci.yml/badge.svg)](https://github.com/WokerJJ/silvacode-v1/actions/workflows/ci.yml)

API REST para gestionar huertos urbanos: cada usuario registra sus jardines (`gardens`), qué cultivos tiene sembrados en cada uno (`crops`, `garden_crops`) y hace seguimiento de fechas de siembra y estado.

Proyecto personal para practicar backend "en serio" (auth, validación, control de acceso, base de datos relacional) antes de escalarlo hacia algo más ambicioso — ver [Visión a futuro](#visión-a-futuro).

## Stack

- **Node.js + Express 5** — servidor HTTP
- **PostgreSQL + Prisma** — base de datos y ORM
- **JWT + bcrypt** — autenticación
- **Zod** — validación de datos de entrada

Frontend en React: planeado, todavía no existe en este repo.

## Arquitectura

```
backend/src/
├── routes/          # define URLs + qué validar antes del controller
├── controllers/      # la lógica de cada endpoint
├── schemas/          # reglas de validación con Zod, una por recurso
├── middlewares/       # auth (JWT), validate (Zod), errorHandler
├── prisma.js         # instancia única de PrismaClient
├── env.js             # carga .env antes que cualquier otro módulo
└── app.js / index.js  # arma la app de Express y la levanta
```

Flujo de una request típica: `routes` → `authMiddleware` (si es privada) → `validate` (Zod) → `controller` → `prisma` (Postgres) → respuesta.

`backend/prisma/schema.prisma` tiene el modelo de datos completo (users, gardens, crops, garden_crops) con sus relaciones.

## Cómo levantarlo

Requiere Node.js y PostgreSQL corriendo localmente.

```bash
cd backend
npm install
```

Crear `backend/.env`:

```
DATABASE_URL="postgresql://usuario:password@127.0.0.1:5432/silvacode?schema=public"
JWT_SECRET="algo-largo-y-aleatorio"
PORT=3000
```

```bash
npx prisma migrate dev   # crea las tablas
npm run seed              # datos de prueba (usuarios alice/bob, cultivos, jardines)
npm run dev                # levanta con nodemon en http://localhost:3000
```

Usuarios de prueba tras el seed: `alice@example.com` / `alice123` y `bob@example.com` / `bob12334`.

### Correr los tests

Los tests pegan contra una base de datos de test separada (`silvacode_test`), nunca contra la de desarrollo. Solo hay que crearla y migrarla una vez:

```bash
createdb -U postgres silvacode_test
```

Crear `backend/.env.test` (mismo formato que `.env`, pero con `DATABASE_URL` apuntando a `silvacode_test`), y aplicar las migraciones ahí:

```bash
$env:DATABASE_URL = "postgresql://usuario:password@127.0.0.1:5432/silvacode_test?schema=public"
npx prisma migrate deploy
```

Después, para correr la suite:

```bash
npm test
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Crea una cuenta (con rate limit) |
| POST | `/auth/login` | No | Devuelve un JWT (con rate limit) |
| POST | `/auth/logout` | Sí | Revoca el token actual |
| GET/POST | `/api/users` | Sí | Listar / crear usuarios |
| GET/PUT/DELETE | `/api/users/:id` | Sí (dueño) | Ver / editar / borrar una cuenta |
| GET/POST | `/api/gardens` | Sí | Listar / crear jardines |
| GET/PUT/DELETE | `/api/gardens/:id` | Sí (dueño) | Ver / editar / borrar un jardín |
| GET/POST | `/api/crops` | Sí | Catálogo de cultivos |
| GET/PUT/DELETE | `/api/crops/:id` | Sí | Ver / editar / borrar un cultivo |

Las rutas privadas van con header `Authorization: Bearer <token>`. "Sí (dueño)" significa que además de estar logueado, el `id` en la URL tiene que ser tuyo — el servidor lo compara contra el `userId` que viene dentro del token, no confía en nada que mande el cliente (ver los comentarios de `gardensController.js` para el porqué).

## Decisiones de diseño que vale la pena recordar

- **Nunca confiar en el cliente para decir "quién es el dueño"**: `user_id` siempre sale del JWT (`req.user.userId`), nunca del body de la request.
- **Nunca devolver el hash de la contraseña**: todos los controllers de `users` usan `select` explícito en vez de devolver el objeto de Prisma completo.
- **`req.validatedBody`/`validatedParams`, no `req.body`/`req.params`**: así queda explícito en el código qué datos ya pasaron por Zod y cuáles no.
- **JWT revocable vía `jti`**: un JWT es válido por firma hasta que expira, así que `logout` no puede "borrarlo" — en vez de eso guarda su `jti` en `revoked_tokens`, y `authMiddleware` lo consulta en cada request además de verificar la firma. Cada login genera un `jti` distinto, así que cerrar una sesión no afecta a otras sesiones del mismo usuario.
- **Rate limiting solo se desactiva en `NODE_ENV=test`**: `/auth/login` y `/auth/register` tienen un límite de 10 intentos cada 15 minutos por IP (`rateLimiter.js`). Los tests de integración reusan el mismo origen en decenas de requests por diseño, así que el limiter se auto-desactiva cuando `NODE_ENV === "test"` — nunca en dev/producción.

## Estado actual / pendientes conocidos

- Tests automatizados con el test runner nativo de Node (`node --test`) + Supertest: unitarios para `slugify` y los schemas de Zod, e integración para auth (incluyendo logout/revocación y rate limiting) y los ownership checks de `gardens`/`users` contra una base de datos de test real. Ver [Correr los tests](#correr-los-tests).
- CI en GitHub Actions (`.github/workflows/ci.yml`): corre `npm test` con un Postgres efímero en cada push a `main` y en cada PR.
- Seguridad HTTP: `helmet` para headers estándar, rate limiting en `/auth/login` y `/auth/register`, y revocación real de JWT vía `POST /auth/logout`.
- `npm audit` reporta 3 vulnerabilidades altas en `deepmerge-ts`, una dependencia transitiva de las herramientas de Prisma (CLI de migraciones), no del servidor en sí — no hay un fix disponible todavía que no rompa Prisma.
- Sin CORS configurado — no es una vulnerabilidad (hoy no hay frontend en otro origen intentando llamar a la API), pero es algo a configurar a propósito cuando exista uno, no antes.
- Sin paginación en `GET /api/users` ni `GET /api/gardens`.
- Sin roles (admin vs usuario normal) — todo usuario autenticado tiene los mismos permisos sobre sus propios recursos.
- Sin manejo de imágenes/fotos para jardines o cultivos.
- Sin despliegue: todo corre local, no hay una demo pública accesible.

## Visión a futuro

La idea a mediano plazo es evolucionar esto hacia algo tipo red social con suscripciones (usuarios que se siguen, comparten sus huertos, y algunos planes de pago desbloquean más funciones). Con la arquitectura actual, los pasos naturales serían:

- **Roles y planes**: agregar un campo `role` o `plan` a `users` y un middleware de autorización más granular que el ownership check actual (que hoy solo distingue "tuyo" vs "de otro").
- **Pagos/suscripciones**: integrar un proveedor (Stripe es el estándar) con webhooks que actualicen el `plan` del usuario — esto normalmente vive en su propio módulo, sin tocar la lógica de `gardens`/`crops`.
- **Features sociales**: seguidores, feed de actividad, jardines públicos vs privados — esto sí requeriría repensar el ownership check actual de `getGardenById`, que hoy es binario (dueño o nadie); un jardín "público" necesitaría una regla distinta a un jardín privado. Los tests de `gardens.test.js` fijan el comportamiento binario actual, así que cualquier cambio hacia "público/privado" debería empezar por actualizar esos tests a propósito, no por accidente.

No hay nada de esto implementado todavía — es solo el norte para que las decisiones de hoy (como el ownership check) no haya que rehacerlas desde cero después.
