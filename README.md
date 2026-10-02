# Montis Plaza

Dos aplicaciones del restaurante **Montis Plaza** sobre una misma API y una misma base de datos:

- **Web pública** — menú, reservas de mesa, pedidos a domicilio y panel de administración.
- **Comandas** — la herramienta del salón: el mesero toma el pedido en la mesa desde el celular, la cocina lo ve aparecer en vivo y cada plato vendido descuenta sus insumos del inventario. Se entrega como **aplicación de escritorio** para el PC del local.

- **Backend:** Node.js + Express, Prisma y PostgreSQL, con WebSocket para el tiempo real.
- **Frontends:** React 19 + Vite (la web pública con Bulma, comandas con Tailwind).
- **Escritorio:** Electron, con el servidor Express corriendo dentro del propio ejecutable.

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

# 4. Levantar API, web pública y comandas a la vez
npm run dev
```

- Web pública: **http://localhost:5173**
- Comandas: **http://localhost:5174**
- API: **http://localhost:8080**

Para la app de escritorio, que abre su propia ventana y trae la API dentro:

```bash
npm run escritorio
```

Al arrancar imprime la dirección de la red local (`http://TU-IP:8080`): es la que los meseros abren en el celular, conectados al mismo WiFi.

¿Algo no arranca? `npm run check` revisa Node, dependencias, variables de entorno, PostgreSQL, migraciones y Redis, y dice qué falta.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | API, web pública y comandas a la vez |
| `npm run dev:api` / `dev:web` / `dev:comandas` | Solo uno de los tres |
| `npm run escritorio` | Compila comandas y abre la aplicación de escritorio |
| `npm run check` | Diagnóstico de la instalación |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run db:seed` | Siembra admin, personal, menú y mesas (idempotente) |
| `npm run build` | Compila los dos frontends a producción |
| `npm run lint` | ESLint sobre los dos frontends |

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
| `MESERO_*`, `COCINA_*` | para la semilla | Cuentas del personal del salón (correo y contraseña) |
| `REDIS_URL` | no | Si está vacía, el rate limiting y los códigos 2FA quedan en memoria |
| `MAIL_*` | no | Sin ellas no se envían correos; el código 2FA se imprime en la consola |
| `GOOGLE_CLIENT_ID` | no | Verifica que el token de Google se emitió para esta app |
| `CORS_ORIGINS` | no | Orígenes permitidos (por defecto `http://localhost:5173,http://localhost:5174`). **El WebSocket valida el `Origin` contra esta lista**: si falta un origen, el tiempo real falla aunque el HTTP funcione |

El frontend usa además `brunchie_design/.env` con `VITE_GOOGLE_CLIENT_ID` (ver `.env.example` de esa carpeta).

---

## Arquitectura

```
Brunchidik/
├── api/                    Backend Express (lo usan las dos aplicaciones)
│   ├── prisma/             Esquema y migraciones versionadas
│   └── src/
│       ├── modules/        Un módulo por dominio (usuarios, menu, pedidos, reservas,
│       │                   contacto, comandas, inventario, reportes)
│       ├── middleware/     Autenticación, roles, rate limiting, validación, errores
│       ├── services/       Correo, códigos 2FA, verificación de Google
│       ├── ws/             Servidor WebSocket y registro de topics
│       └── lib/            JWT, fechas, serialización del JSON de la API
├── brunchie_design/        Web pública — React + Vite + Bulma
├── comandas/               App del salón — React + Vite + Tailwind
├── escritorio/             Envoltorio Electron: abre la ventana y levanta la API dentro
├── scripts/check-setup.js  Diagnóstico de la instalación
└── docker-compose.yml      Alternativa con contenedores (solo API y web pública)
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
