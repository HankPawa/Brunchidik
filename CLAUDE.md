# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Brunch & Co.** is a full-stack restaurant web app: menu, table reservations, delivery orders and an admin panel. The backend is a single Express app (`api/`); the frontend is a React SPA (`brunchie_design/`).

Migrated from 5 Spring Boot microservices to Express in September 2026. There is no Java in the repo any more.

---

## Commands

Run from the repo root:

```bash
npm run setup     # install everything + migrate + seed (first time)
npm run dev       # API (8080) and frontend (5173) together
npm run check     # diagnose Node, deps, .env, PostgreSQL, migrations, Redis
npm run lint      # eslint on the frontend
npm run build     # production build of the frontend
```

Backend-only commands live in `api/`:

```bash
cd api
npm run dev            # nodemon
npm run seed           # idempotent seed (admin + menu)
npm run db:migrate     # prisma migrate deploy
npx prisma studio      # inspect the database
```

---

## Architecture

### Backend (`api/`)

One Express app, modular by domain. Key layout:

```
api/src/
├── server.js            HTTP server + WebSocket + seed + graceful shutdown
├── app.js               middleware chain and router mounting
├── config/              env validation, Prisma client, Redis/memory store
├── lib/                 jwt, time, serialize (JSON shape), schemas, errors
├── middleware/          auth, rateLimit, validate, errorHandler
├── modules/<dominio>/   routes.js / routes.admin.js / controller.js / schemas.js
├── services/            email, codigo2fa, google
├── ws/                  hub.js (topic registry), index.js (server)
└── seed/                idempotent seed data
```

**Routers are split by exposure**: `routes.js` (public/user) vs `routes.admin.js`, and the admin router mounts `requireAdmin` on the whole `Router()`. Never add an admin endpoint to the public router.

**`lib/serialize.js` is load-bearing.** Controllers must never return raw Prisma objects. The mappers there fix the exact JSON the frontend consumes: BigInt→Number, Decimal→Number, dates as naive strings without `Z`, `categoriaId` flattened, `categoria.items` renamed, `password` never serialized. Changing a mapper silently breaks the frontend.

**Timestamps have no timezone** in the DB (inherited from Hibernate). `lib/time.js` treats them as local wall-clock carried in a Date's UTC fields. Use `nowNaive()` to write and the `format*` helpers to read; never emit a `Z` suffix.

### Authentication

JWT (HS256, 7 days) signed with `JWT_SECRET`. Issued on login, Google login and 2FA verification — **not** on registration. The frontend keeps it in `localStorage["brunch_token"]`, separate from the user object, and `authFetch` in `AuthContext` attaches it and logs out on 401.

Middleware: `requireAuth` → `requireAdmin` (re-reads the role from the DB, so a demoted admin loses access immediately) → `requireSelf(param)` for ownership. `optionalAuth` is used by `POST /api/pedidos` because **checkout allows guests**.

2FA codes live in Redis (or memory) with a 300s TTL, single use, invalidated after 5 failed attempts.

### WebSocket

Single endpoint `/ws` on the API port. JSON protocol: client sends `{type:"auth",token}` then `{type:"subscribe",topics:[...]}`; server pushes `{type:"message",topic,data}`. Topic strings kept from the old STOMP setup:

- `/topic/admin/pedidos`, `/topic/admin/pedidos/estado`, `/topic/admin/reservas` — require ADMIN
- `/topic/usuario/{id}/pedido` — only that user

The frontend hook `brunchie_design/src/hooks/useWebSocket.js` keeps **one shared connection** with per-topic reference counting; signature is `(wsPath, topics, onMessage)` with `wsPath` always `"/ws"`.

### Data layer

Prisma over PostgreSQL with **versioned migrations** in `api/prisma/migrations`. The baseline (`0_init`) was hand-written from the Hibernate schema to preserve IDENTITY columns and CHECK constraints.

Enums (`rol`, `estado`) are `varchar` with CHECK constraints in the DB and `z.enum` in the API — they are not Prisma enums, on purpose. Don't convert them without a migration.

### Degraded modes

Redis is optional. Rate limiting **fails open** to an in-memory counter; 2FA **fails closed** with 503 if `REDIS_URL` is set but unreachable (a security control must not silently degrade). With `REDIS_URL` empty, both use memory.

Mail is optional too: without `MAIL_USER`/`MAIL_PASSWORD` the 2FA code is printed to the console.

### Frontend (`brunchie_design/`)

React 19 + Vite. Four contexts in `App.jsx`: `AuthContext` (session + `authFetch`), `CartContext` (`brunch_cart`), `FavoritesContext`, `DarkModeContext` (toggles `.dark` on `<html>`). Guards: `ProtectedRoute`, `AdminRoute`.

Vite proxies `/api` and `/ws` to `http://localhost:8080`.

Styling is currently Bulma + per-page CSS files. **A migration to Tailwind is planned** (see the plan in `~/.claude/plans/`): Bulma is only used in `Navbar`, `Hero` and `Favorites`; the real work is ~4.200 lines of custom CSS and the `dark.css` rules.

---

## Business rules worth knowing

- **Scheduled orders** are available to everyone (the old Premium tier was removed in September 2026). Delivery window enforced server-side: Mon-Fri 08:00-16:00, Sat 09:00-16:00, closed Sunday.
- **Order totals come from the client** and are stored as sent. Known debt: the server should recompute them from real prices.
- **Audit log** is one shared table with a `servicio` column (`menu` / `pedidos`); each endpoint filters by its own service.
- Reservation confirmation emails and 2FA emails are best-effort: a failure is logged but never breaks the request.

## Conventions

- JavaScript with ES modules, no TypeScript (deliberate: this machine has very little RAM).
- Error responses are **plain text**, because the frontend displays them directly. The only JSON error is the 429 from the rate limiter.
- Code comments and user-facing strings are in Spanish; these docs are in English.
