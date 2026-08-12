al# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**BrunchDesign** is a full-stack web application for the restaurant **Brunch & Co.** featuring a menu, table reservations, delivery orders, subscriptions, and an admin panel. The backend is split into 5 independent microservices; the frontend is a React SPA.

---

## Commands

### Frontend (`brunchie_design/`)

```bash
cd brunchie_design
npm install          # first time
npm run dev          # dev server at http://localhost:5173
npm run build        # production build
npm run lint         # eslint
```

### Backend — each microservice is independent

```bash
# Run any service locally (from its directory):
cd usuario-service   # or menu-service / pedido-service / reserva-service / contacto-service
mvn spring-boot:run

# Build without tests (as CI does):
mvn package -DskipTests -B
```

### Docker (full stack)

```bash
# Requires .env in project root with DB_URL, DB_USER, DB_PASSWORD, MAIL_USER, MAIL_PASSWORD
docker compose up --build          # build and start all
docker compose up --build frontend # rebuild only the frontend
docker compose logs -f pedido-service
```

Required `.env` contents — see `MANUAL.md` §2 for values.

---

## Architecture

### Service map

| Service | Port | Package | Responsibility |
|---|---|---|---|
| `usuario-service` | 8081 | `com.brunch.usuario` | Auth, 2FA, roles, subscriptions |
| `menu-service` | 8082 | `com.brunch.menu` | Menu items, categories, admin CRUD |
| `pedido-service` | 8083 | `com.brunch.pedido` | Orders (normal + scheduled), WebSocket |
| `reserva-service` | 8084 | `com.brunch.reserva` | Table reservations, WebSocket |
| `contacto-service` | 8085 | `com.brunch.contacto` | Contact form messages |
| `frontend` | 80/5173 | `brunchie_design/` | React SPA served by nginx |

### Internal structure (every microservice)

```
{service}/src/main/java/com/brunch/{domain}/
├── {Domain}Application.java
├── config/          — CorsConfig, DataInitializer (seed data)
├── filter/          — RateLimitFilter (Redis-backed, every service)
├── model/           — JPA entities
├── repository/      — Spring Data JPA
├── service/         — business logic interface + impl
└── controller/      — REST controllers
```

### No API gateway

There is no service-mesh or gateway. In dev, Vite proxies requests; in production, nginx does the same routing. The proxy map (both match exactly) is in `brunchie_design/vite.config.js`:

- `/api/usuarios` → 8081
- `/api/categorias`, `/api/menu`, `/api/admin/menu` → 8082
- `/api/pedidos`, `/api/admin/pedidos` → 8083
- `/api/reservas`, `/api/admin/reservas` → 8084
- `/api/contacto` → 8085
- `/ws-pedidos` → 8083/ws (WebSocket)
- `/ws-reservas` → 8084/ws (WebSocket)

### No inter-service HTTP calls

Services do not call each other. Cross-service relationships are stored by plain ID (e.g., `usuarioId` on `Pedido`). If you need to enrich data across services, the frontend fetches each service independently.

### Frontend React context

Four contexts wrap the app in `App.jsx`:
- `AuthContext` — user session (persisted to `localStorage` as `brunch_user`); exposes `login`, `loginWithGoogle`, `register`, `toggle2fa`, `verifyCode`, `logout`
- `CartContext` — cart items (persisted as `brunch_cart`); computes subtotal/shipping/total
- `FavoritesContext` — favorited menu items
- `DarkModeContext` — dark mode toggle

Route guards: `ProtectedRoute` redirects to `/login` if no user; `AdminRoute` additionally checks `user.rol === "ADMIN"`.

### WebSocket (real-time admin panel)

`pedido-service` and `reserva-service` each expose a STOMP broker at `/ws`. After admin state changes, messages are broadcast to:
- `/topic/admin/pedidos` — new order created
- `/topic/admin/pedidos/estado` — order state updated
- `/topic/usuario/{id}/pedido` — user-specific order update
- `/topic/admin/reservas` — new reservation created

The frontend hook `brunchie_design/src/hooks/useWebSocket.js` connects via the Vite/nginx proxy paths (`/ws-pedidos`, `/ws-reservas`).

### Authentication model

There is **no JWT and no Spring Security**. The `UsuarioController` manually checks BCrypt hashes. The logged-in user object is stored in React state and `localStorage`. **Admin endpoint protection is frontend-only** — `AdminRoute` blocks the UI, but the backend `/api/admin/*` endpoints have no server-side role check.

### 2FA codes

Stored in a `ConcurrentHashMap` inside `CodigoService` (in-memory, not Redis). Codes expire after 5 minutes. **Codes are lost on service restart.**

### Rate limiting

Every service has a `RateLimitFilter` (highest precedence) backed by Redis. Rules per endpoint per IP, e.g.:
- `POST /api/usuarios/login` → 10 req/60 s
- `POST /api/usuarios/2fa/enviar` → 5 req/60 s
- Default → 60 req/60 s

### Audit log

`menu-service` and `pedido-service` have an `AuditLog` JPA entity recording admin actions (create/edit/delete product, change order state). Accessible at `GET /api/admin/menu/audit` and `GET /api/admin/pedidos/audit`.

### Database

All services share the same Neon PostgreSQL database. Schema is managed with `ddl-auto=update`. Profile `neon` activates `application-neon.properties` with the real credentials; profile `local` falls back to a local PostgreSQL instance.

### External services

| Service | Purpose | Config location |
|---|---|---|
| Neon PostgreSQL | Database | `application-neon.properties` in each service |
| Redis | Rate limiting (all services) | `REDIS_HOST` / `REDIS_PORT` env vars |
| Resend SMTP | 2FA emails, reservation confirmation | `usuario-service` + `reserva-service` |
| Cloudinary | Menu item image uploads | cloud `dwhezsxkg`, preset `brunch_menu` (unsigned) |
| Google OAuth | Social login | `VITE_GOOGLE_CLIENT_ID` env var |

### Subscription / premium features

`Usuario.suscrito` flag gates scheduled orders in `pedido-service`. Scheduled orders require `fechaProgramada` between 08:00 and 15:00. The enforcement is **frontend-only** (the backend accepts any `fechaProgramada`).
