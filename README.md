# Brunch & Co.

Aplicación web del restaurante **Brunch & Co.**: menú, reservas de mesa, pedidos a domicilio y panel de administración.

- **Backend:** Node.js + Express, Prisma y PostgreSQL, con WebSocket para el panel en tiempo real.
- **Frontend:** React 19 + Vite.

---

## Arrancar en local

Necesitas **Node.js 20+** y **PostgreSQL** corriendo. Redis es opcional.

```bash
# 1. Crear la base de datos (una sola vez)
createdb brunch_db

# 2. Configurar el backend
cp api/.env.example api/.env     # y completa DATABASE_URL, JWT_SECRET, ADMIN_*

# 3. Instalar dependencias, aplicar migraciones y sembrar datos
npm run setup

# 4. Levantar backend y frontend a la vez
npm run dev
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:8080**

¿Algo no arranca? `npm run check` revisa Node, dependencias, variables de entorno, PostgreSQL, migraciones y Redis, y dice qué falta.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Backend y frontend a la vez |
| `npm run dev:api` / `npm run dev:web` | Solo uno de los dos |
| `npm run check` | Diagnóstico de la instalación |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run db:seed` | Siembra admin y menú inicial (idempotente) |
| `npm run build` | Compila el frontend a producción |
| `npm run lint` | ESLint sobre el frontend |

### Con Docker (opcional)

```bash
cp .env.example .env    # completa POSTGRES_PASSWORD y JWT_SECRET
docker compose up --build
```

Levanta PostgreSQL, Redis, la API y el frontend con nginx en **http://localhost**.

---

## Configuración

Ninguna credencial está escrita en el código: todo sale de `api/.env` (o del `.env` de la raíz si usas Docker). Si falta algo obligatorio, el servidor no arranca y dice exactamente qué.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | sí | Conexión a PostgreSQL (formato Prisma, no JDBC) |
| `JWT_SECRET` | sí | Firma de los tokens de sesión (mínimo 32 caracteres) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | para la semilla | Usuario administrador inicial |
| `REDIS_URL` | no | Si está vacía, el rate limiting y los códigos 2FA quedan en memoria |
| `MAIL_*` | no | Sin ellas no se envían correos; el código 2FA se imprime en la consola |
| `GOOGLE_CLIENT_ID` | no | Verifica que el token de Google se emitió para esta app |
| `CORS_ORIGINS` | no | Orígenes permitidos (por defecto `http://localhost:5173`) |

El frontend usa además `brunchie_design/.env` con `VITE_GOOGLE_CLIENT_ID` (ver `.env.example` de esa carpeta).

---

## Arquitectura

```
Brunchidik/
├── api/                    Backend Express
│   ├── prisma/             Esquema y migraciones versionadas
│   └── src/
│       ├── modules/        Un módulo por dominio (usuarios, menu, pedidos, reservas, contacto)
│       ├── middleware/     Autenticación, rate limiting, validación, errores
│       ├── services/       Correo, códigos 2FA, verificación de Google
│       ├── ws/             Servidor WebSocket y registro de topics
│       └── lib/            JWT, fechas, serialización del JSON de la API
├── brunchie_design/        Frontend React + Vite
├── scripts/check-setup.js  Diagnóstico de la instalación
└── docker-compose.yml      Alternativa con contenedores
```

### Autenticación

Al iniciar sesión el backend devuelve el usuario junto a un **JWT** firmado (7 días). El frontend lo guarda en `localStorage` y lo envía como `Authorization: Bearer`. El servidor valida firma y rol en cada petición protegida, y comprueba la propiedad de los datos: nadie puede ver ni modificar pedidos o reservas de otra persona.

Con 2FA activo, el login no entrega token: envía un código de 6 dígitos por correo (válido 5 minutos, un solo uso, se invalida tras 5 intentos fallidos) y el token llega al verificarlo.

### WebSocket

La API expone `/ws`. El cliente se autentica con su token en el primer mensaje y se suscribe a topics; solo recibe los que le corresponden (los de administración exigen rol ADMIN). Se usa para que el panel vea pedidos y reservas entrar en vivo, y para que cada usuario siga el estado de su pedido.

### Base de datos

PostgreSQL gestionado con **migraciones de Prisma versionadas** (`api/prisma/migrations`): en una máquina nueva, `npm run db:migrate` reconstruye el esquema exacto.

---

## Credenciales de prueba

El usuario administrador es el que definas en `ADMIN_EMAIL` / `ADMIN_PASSWORD` antes de sembrar. Accede al panel en `/admin`.
