# CLAUDE.md — SilvaCode / FloraCode

Contexto para que Claude entienda este proyecto y el entorno de desarrollo desde el primer momento, sin tener que redescubrirlo cada sesión.

## Qué es esto

API REST en Node.js/Express + Prisma + PostgreSQL para gestionar huertos urbanos (jardines, cultivos, usuarios). El dueño del proyecto (Jhon) es un dev junior (estudiante INTEP) construyendo esto como proyecto personal, con la intención de evolucionarlo eventualmente hacia un modelo de suscripciones estilo red social (ver "Visión a futuro" en el [README.md](README.md)). No tomes decisiones de arquitectura que cierren esa puerta sin decirlo explícitamente.

Los comentarios del código están escritos deliberadamente para que Jhon los entienda (explican el *por qué*, no el *qué*). Si tocas código con ese tipo de comentario, mantén el mismo estilo — no lo borres para "limpiar".

## Entorno local (Windows, sin permisos de Administrador)

Esta sesión NO tiene derechos de Administrador en la máquina. Esto tiene consecuencias permanentes, no son bugs a "arreglar":

- **PostgreSQL 17 no corre como servicio de Windows administrado desde aquí.** Después de cada reinicio de la PC hay que levantarlo a mano:
  ```
  & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\17\data" -l "C:\Program Files\PostgreSQL\17\data\log.txt"
  ```
  `Stop-Service`/`Start-Service` fallarán con "No se puede abrir el servicio" — es esperado, no un error a diagnosticar.
- **Contraseña del superusuario `postgres` en dev:** `silvacode_dev_2026` (bootstrapeada vía single-user mode con permiso explícito del usuario, ver historial). `pg_hba.conf` usa `scram-sha-256` normal, no se tocó — no hace falta ni se debe editar ese archivo.
- Si `npm run dev` falla con "No es posible conectar con el servidor remoto" justo después de arrancar, puede ser solo timing (el server tarda unos segundos en levantar) — no asumas regresión antes de reintentar con una espera de ~8s.

## `.env` (no versionado, ya existe en `backend/.env`)

```
DATABASE_URL="postgresql://postgres:silvacode_dev_2026@127.0.0.1:5432/silvacode?schema=public"
JWT_SECRET="dev_secret_change_me_silvacode_2026"
PORT=3000
```

Si falta o se borra, el server crashea a propósito con `Error: Falta JWT_SECRET en las variables de entorno` (ver regla de abajo — es intencional, no un bug).

## Reglas del proyecto (no romper estos patrones)

1. **`backend/src/env.js` debe ser el PRIMER import de `backend/src/app.js`, sin excepción.** Es lo que carga `.env` vía `process.loadEnvFile()`. Por el hoisting de imports en ES modules, si esto no es literalmente la primera línea, algún middleware que lee `process.env.JWT_SECRET` a nivel de módulo se ejecuta antes de que el `.env` se haya cargado, y el server crashea al arrancar. Ya se depuró este bug una vez — no reintroducirlo.

2. **Nunca agregar un fallback hardcodeado para `JWT_SECRET` (tipo `"supersecret"`).** Si falta la env var, el server debe tirar error al arrancar (`if (!JWT_SECRET) throw new Error(...)`), no arrancar con un secreto débil por defecto.

3. **Todo endpoint de escritura/lectura de un recurso propio debe verificar ownership contra `req.user.userId` (del JWT verificado), nunca contra un `id` que venga del cliente (body, params, query).** Patrón ya aplicado en `gardensController.js` y `usersController.js`:
   ```js
   if (recurso.user_id !== req.user.userId) return res.status(403)...
   ```
   Al crear un recurso, `user_id` SIEMPRE sale de `req.user.userId`, nunca de `req.body.user_id` (el cliente no puede asignar dueño).

4. **Los controllers deben leer `req.validatedBody` / `req.validatedParams` / `req.validatedQuery`, nunca `req.body`/`req.params`/`req.query` directamente.** El middleware `validate.js` los popula después de pasar por Zod; usar los crudos salta la validación (bug real que ya se corrigió una vez).

5. **Ningún endpoint debe devolver el campo `password` (hash) de un usuario.** Usar siempre un `select` explícito que lo excluya (ver `publicUserSelect` en `usersController.js`) — nunca devolver el objeto Prisma completo de `User`.

6. **`errorHandler.js` solo debe incluir `err.message` en la respuesta cuando `NODE_ENV !== "production"`.** No revertir esto — evita filtrar detalles internos en prod.

7. **`authMiddleware.js` es async y consulta `revoked_tokens` en cada request, además de verificar la firma del JWT.** Es lo que hace que `logout` invalide de verdad un token (ver punto 8) — no volverlo síncrono ni sacar esa consulta pensando que es redundante con `jwt.verify`.

8. **Cada login genera un `jti` (UUID) nuevo y lo mete en el payload del JWT.** `logout` guarda ese `jti` en `revoked_tokens` hasta que el token expira por su cuenta. Si algún día se cambia cómo se firma el JWT, el `jti` tiene que seguir yendo en el payload o la revocación deja de funcionar en silencio (ningún test lo va a notar porque `authMiddleware` simplemente no encontraría nada que revocar).

9. **`/auth/login` y `/auth/register` pasan por `authLimiter` (`rateLimiter.js`) antes que por `validate`.** Se autodesactiva solo cuando `NODE_ENV === "test"` — no agregar ese mismo `skip` a mano en otro lado ni subir el límite "para que los tests pasen"; si un test necesita probar el límite de verdad, usa `createAuthLimiter({ skipInTest: false })` en una app descartable, como hace `rateLimiter.test.js`.

## Credenciales de prueba (seed)

```
alice@example.com / alice123
bob@example.com   / bob12334
```
Corridas de `npm run seed` son idempotentes y auto-reparan contraseñas en texto plano si alguna vez quedaron mal insertadas (el `upsert` sobreescribe `password` en el `update`, no lo deja vacío).

## Tests

Hay tests reales con el test runner nativo de Node (`node --test`, sin Jest/Vitest — no hacía falta la dependencia extra) + Supertest para las rutas HTTP:

- `backend/src/utils/slugify.test.js`, `backend/src/schemas/schemas.test.js` — unitarios, sin DB.
- `backend/tests/auth.test.js`, `backend/tests/gardens.test.js`, `backend/tests/users.test.js` — integración vía Supertest contra `app.js` (sin levantar el server con `.listen`), pegándole a una base de datos de test real y separada: `silvacode_test`.

**Reglas de los tests, no romperlas:**

1. Cada archivo de test importa `./setup.js` como su PRIMER import, antes que `app.js`. `setup.js` pone `process.env.NODE_ENV = "test"`, y `env.js` lee esa variable para decidir si carga `.env` o `.env.test` — mismo principio de import-order que la regla 1 de arriba, aplicado a los tests.
2. `backend/.env.test` (gitignored, igual que `.env`) apunta a `silvacode_test`, no a `silvacode`. Si no existe, hay que crearlo (ver README, sección "Correr los tests").
3. `package.json` corre los tests con `--test-concurrency=1`. Sin eso, Node corre los archivos de test en paralelo y, como todos comparten la misma base `silvacode_test`, se pisan entre sí (duplicados de `username`/`email`, resultados intermitentes). No sacar ese flag.
4. `tests/helpers.js` tiene `resetDb()` (trunca todo entre tests) y `createTestUser()` (registra + loguea, devuelve `{ id, token }`) — reusar en vez de duplicar el setup en cada test nuevo.

Escribiendo los tests de integración salió un bug real: `validate.js` usaba `err.errors`, pero en Zod v4 esa propiedad no existe (es `err.issues`) — cualquier validación fallida crasheaba con 500 en vez de 400. Ya está corregido; si algún día se toca `validate.js`, no reintroducir `.errors`.

## CI

`.github/workflows/ci.yml` corre en cada push a `main` y en cada PR: levanta un Postgres efímero como servicio, aplica las migraciones (`prisma migrate deploy`) y corre `npm test`. No depende de `backend/.env.test` — las variables (`DATABASE_URL`, `JWT_SECRET`) van directo en el `env:` del job, y `env.js` cae en un ENOENT silencioso al no encontrar el archivo y usa esas variables del proceso tal cual (mismo mecanismo que en producción).

## Seguridad

- **Helmet** (`app.js`) — headers HTTP estándar, sin configuración especial.
- **Rate limiting** en `/auth/login`/`/auth/register` — ver reglas 9 arriba.
- **Revocación de JWT vía `jti`** — ver reglas 7 y 8 arriba. La tabla `revoked_tokens` se limpia sola en cada logout (borra entradas ya vencidas), no hay cron aparte.
- **CORS: deliberadamente sin configurar.** No es una vulnerabilidad — hoy no hay ningún frontend en otro origen llamando a la API. Cuando exista uno (el frontend en React de la visión a futuro), hay que configurarlo explícitamente entonces, no antes ni "por si acaso".

## Estado conocido / pendiente (no asumir que falta arreglar sin confirmar)

- `npm audit`: 3 vulnerabilidades restantes, todas en `deepmerge-ts` (transitiva de `@prisma/config`, solo CLI de Prisma, no corre en el server real). `--force` haría un downgrade breaking que ni siquiera resuelve el problema — decisión consciente de no aplicarlo, documentada en el README.
- No hay paginación en `GET /api/users` ni `GET /api/gardens`.
- No hay sistema de roles/permisos todavía.
- Sin manejo de imágenes/fotos para jardines o cultivos.
- Sin despliegue: todo corre local. No hay demo accesible públicamente.

## Comandos útiles

```
cd backend
npm run dev          # levanta el server (requiere postgres corriendo y .env presente)
npx prisma migrate dev
npm run seed
npm test              # requiere silvacode_test creada y migrada (ver README)
npm audit
```
