# CoWork Hub

App web (con PWA instalable) para gestionar un espacio de coworking:
miembros, planes, espacios reservables, reservas y facturación.

---

## Stack

- **Backend**: Node.js + Express (JavaScript).
- **Base de datos**: MySQL 8 + Sequelize (ORM).
- **Sesión**: JWT dentro de una cookie `httpOnly` (no localStorage) + CSRF
  con patrón *double-submit cookie*.
- **Validación**: Zod (frontend valida en HTML5, el servidor SIEMPRE
  revalida — nunca se confía en el cliente).
- **Frontend**: HTML + CSS + JavaScript vanilla, PWA (manifest + service worker).
- **Documentación de API**: Swagger UI en `/docs`.

---

## Por qué MySQL (relacional) y no NoSQL

El dominio de CoWork Hub encaja con el **Escenario A** (relacional) del
enunciado:

- La forma de los datos es **fija y estable**: un miembro siempre tiene los
  mismos campos, una reserva siempre tiene un espacio, un horario y un
  miembro.
- Hay **relaciones que deben mantenerse consistentes**: miembro→plan,
  reserva→miembro, reserva→espacio. Un relacional impone esa integridad a
  nivel de motor (foreign keys), no solo a nivel de código de aplicación.
- La regla de oro del negocio — *"un espacio no puede estar reservado dos
  veces en el mismo horario"* — y la regla de facturación — *"debe cuadrar
  al centavo"* — son operaciones **todo o nada**. MySQL da transacciones
  ACID reales; NoSQL orientado a documentos no ofrece esa garantía tan
  naturalmente entre colecciones distintas.
- Los reportes del admin son **consultas cruzadas y filtradas** (por
  miembro, por espacio, por rango de fechas) que se corren "todos los
  días" y deben ser rápidas incluso con miles de reservas: eso es
  exactamente lo que los **índices compuestos** de un relacional resuelven
  bien (ver `docs/EER.md`).

Un NoSQL habría sido razonable si el negocio fuera, por ejemplo, un feed de
actividad o logging de sensores (alto volumen de escritura, esquema
cambiante) — no es el caso aquí.

---

## Patrón de diseño: Chain of Responsibility

Crear una reserva debe pasar varias reglas de negocio independientes:
espacio activo, sin solapamiento de horario, tipo de espacio permitido por
el plan, y límite de horas del plan. En vez de meter todo eso en un método
gigante, cada regla es un **eslabón** de una cadena
(`src/patterns/reservationChain.js`):

```
SpaceMustBeActiveRule -> NoOverlapRule -> PlanSpaceTypeRule -> PlanHoursLimitRule
```

- **Single Responsibility**: cada regla se entiende y se prueba sola.
- **Open/Closed**: si el negocio pide una regla nueva (ej. "la sala de
  eventos no se reserva con menos de 24h de anticipación"), se agrega un
  eslabón nuevo sin tocar los existentes.

Como patrón complementario, uso **Repository** (`src/repositories/`) para
aislar el acceso a datos de Sequelize: los servicios no saben que hay un
ORM ni MySQL detrás, lo que facilita cambiar de motor o mockear en pruebas.

---

## SOLID — dónde se aplica

| Principio | Dónde |
|---|---|
| **S**ingle Responsibility | Cada capa (`controllers` reciben HTTP, `services` tienen la regla de negocio, `repositories` hablan con la BD) tiene una sola razón para cambiar. Cada regla en `reservationChain.js` valida una sola cosa. |
| **O**pen/Closed | La cadena de reglas de reserva se extiende agregando eslabones nuevos, sin modificar los existentes. |
| **L**iskov Substitution | Todas las reglas de `reservationChain.js` heredan de `ReservationRule` y son intercambiables/encadenables entre sí sin romper el contrato `check(context)`. |
| **I**nterface Segregation | Cada repositorio expone solo los métodos que su dominio necesita (`MemberRepository` no tiene métodos de `Space`, etc.) en vez de un repositorio genérico gigante. |
| **D**ependency Inversion | Los `services` dependen de los `repositories` (abstracción de acceso a datos), nunca importan Sequelize directamente. |

---

## Seguridad

- **Rutas protegidas por middleware** (`middlewares/auth.js` +
  `middlewares/authorize.js`), nunca chequeo de permisos "a mano" dentro de
  cada handler.
- **Sesión en cookie `httpOnly` + `SameSite=lax`** (y `Secure` en
  producción) — nunca en `localStorage`.
- **CSRF**: patrón double-submit cookie (`middlewares/csrf.js`): al hacer
  login se entrega también una cookie `cwh_csrf` (no httpOnly) que el
  frontend debe reenviar como header `X-CSRF-Token` en cada petición que
  modifica datos.
- **SQL Injection**: Sequelize usa consultas parametrizadas; nunca se
  concatenan strings en queries.
- **XSS**: `middlewares/sanitize.js` limpia toda entrada de texto con la
  librería `xss`, más cabeceras de seguridad con `helmet`.
- **Rate limiting**: general (`middlewares/rateLimit.js`) y más estricto en
  `/auth/login` y `/auth/register` para mitigar fuerza bruta.
- **Secretos fuera del código**: todo vive en `.env` (ver `.env.example`),
  nunca hardcodeado.
- **Passwords**: hasheados con `bcryptjs` (nunca texto plano).

---

## Estructura de carpetas (backend)

```
backend/src/
  config/        # conexión a MySQL, swagger
  models/        # entidades Sequelize + asociaciones + índices
  repositories/  # acceso a datos (patrón Repository)
  services/      # lógica de negocio
  patterns/      # Chain of Responsibility de validación de reservas
  controllers/   # reciben/responden HTTP
  middlewares/   # auth, authorize, validate, sanitize, csrf, rateLimit, errorHandler
  schemas/       # esquemas de validación Zod
  routes/        # definición de endpoints
  seed.js        # datos de prueba (usado por npm run seed y POST /test/seed)
  app.js         # configuración de Express
  server.js      # arranque del servidor
```

---

## Cómo correr el proyecto

### Opción A — Docker (recomendada)

```bash
docker compose up --build
```

Esto levanta MySQL + el backend en `http://localhost:4000`.
Luego corre el seed:

```bash
docker compose exec backend node src/seed.js
```

### Opción B — Local

```bash
cd backend
cp .env.example .env      # y ajusta credenciales de tu MySQL local
npm install
npm run seed               # crea datos de prueba
npm run dev                 # http://localhost:4000
```

Frontend (cualquier servidor estático, ej. desde `/frontend`):

```bash
cd frontend
npx serve .    # o "python3 -m http.server 5173"
```

Documentación interactiva de la API: `http://localhost:4000/docs`

---

## Credenciales de prueba (tras el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@coworkhub.test` | `Admin1234!` |
| Miembro (plan Básico, 10h) | `ana@coworkhub.test` | `Miembro1234!` |
| Miembro (plan Pro, 30h) | `carlos@coworkhub.test` | `Miembro1234!` |

`POST /test/seed` reinicia la base a este mismo estado (deshabilitado si
`NODE_ENV=production`).

---

## Los 5 contratos de prueba de caja negra

| # | Contrato | Cómo se cumple |
|---|---|---|
| 1 | `POST /auth/login` malas credenciales → 401 sin cookie; buenas → 200 + cookie | `authController.login` + `AuthService.login` |
| 2 | Ruta privada sin sesión → 401; miembro en ruta admin → 403 | `middlewares/auth.js` (401) + `middlewares/authorize.js` (403) |
| 3 | Reserva válida → 201; misma reserva solapada → 409 | `ReservationService.create` (transacción + `NoOverlapRule`) |
| 4 | Reserva que excede horas del plan → 422 | `PlanHoursLimitRule` en la cadena |
| 5 | `GET /reports/consumo` cuadra al centavo | `ReportService.consumo` usa `hourly_rate_snapshot` de cada reserva real |

---

## Modelo de datos

Ver [`docs/EER.md`](docs/EER.md) para el diagrama EER completo y la
justificación de cada decisión de modelado (normalización, índices,
integridad referencial).

---

## Extras implementados

- 🍪 Cookie `httpOnly` + `Secure` (en producción) + `SameSite=lax`.
- 🐳 Docker + `docker-compose` con MySQL.
- 📊 Rate limiting + manejo de errores centralizado.
- 📝 Documentación Swagger/OpenAPI en `/docs`.

## Pendiente / próximos pasos sugeridos

- Pruebas de integración automatizadas (supertest) contra los 5 contratos.
- CI/CD con GitHub Actions.
- Despliegue público (Railway/Render) con URL.
