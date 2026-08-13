# BrunchDesign

Aplicación web para Brunch & Co. — menú, reservas, pedidos y panel de administración.

**Stack:** React + Vite · Spring Boot 3.4 · PostgreSQL (Neon)

---

## Requisitos

- Node 20+
- Java 23 + Maven 3.9+
- (Opcional) Docker + Docker Compose

---

## Desarrollo local

### 1. Variables de entorno

**Frontend** — copia y rellena:
```bash
cp brunchie_design/.env.example brunchie_design/.env
```

**Backend** — copia y rellena (si usas Neon):
```bash
cp .env.example .env
```

### 2. Levantar el backend

```bash
cd backend
# Con Neon (requiere .env con DB_URL, DB_USER, DB_PASSWORD):
SPRING_PROFILE=neon DB_URL=... DB_USER=... DB_PASSWORD=... mvn spring-boot:run

# Con PostgreSQL local (sin variables extra):
mvn spring-boot:run
```

Puerto: `http://localhost:8080`

### 3. Levantar el frontend

```bash
cd brunchie_design
npm install
npm run dev
```

Puerto: `http://localhost:5173`

---

## Docker (backend + frontend juntos)

```bash
# Copia y rellena el .env raíz
cp .env.example .env

# Levantar todo
docker compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`

---

## CI/CD

GitHub Actions corre automáticamente en cada push a `main`:
- Build del backend (`mvn package`)
- Build del frontend (`npm run build`)

Requiere el secret `VITE_GOOGLE_CLIENT_ID` configurado en GitHub → Settings → Secrets.

---

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | frontend `.env` | Client ID de Google OAuth |
| `SPRING_PROFILE` | backend / `.env` | `local` o `neon` (default: `local`) |
| `DB_URL` | backend / `.env` | URL JDBC de PostgreSQL |
| `DB_USER` | backend / `.env` | Usuario de la BD |
| `DB_PASSWORD` | backend / `.env` | Contraseña de la BD |
| `CORS_ORIGINS` | backend / `.env` | Origen(es) permitidos, separados por coma |
| `PORT` | backend / `.env` | Puerto del servidor (default: `8080`) |
