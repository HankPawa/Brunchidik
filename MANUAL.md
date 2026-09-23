# Manual de instalación y uso — Brunch & Co.

## 1. Requisitos

| Herramienta | Versión | Descarga |
|---|---|---|
| Node.js | 20 o superior | https://nodejs.org |
| PostgreSQL | 15 o superior | https://www.postgresql.org/download/ |
| Git | Cualquiera | https://git-scm.com |

Redis es **opcional**: si no está, el limitador de peticiones y los códigos de verificación funcionan en memoria.

> ¿Prefieres no instalar nada? Hay una alternativa con Docker en la sección 8.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/HankPawa/Brunchidik.git
cd Brunchidik
```

---

## 3. Configurar las credenciales

Las credenciales **no están en el repositorio**. Hay que crear dos archivos a partir de sus plantillas.

**`api/.env`** (backend):

```bash
cp api/.env.example api/.env
```

Valores obligatorios:

| Variable | Qué poner |
|---|---|
| `DATABASE_URL` | `postgresql://USUARIO:CONTRASEÑA@localhost:5432/brunch_db?schema=public` |
| `JWT_SECRET` | Cadena aleatoria de 32+ caracteres. Genérala con:<br>`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | El administrador que quieres crear |

Opcionales: `REDIS_URL`, `MAIL_*` (envío de correos), `GOOGLE_CLIENT_ID`, `CORS_ORIGINS`.

**`brunchie_design/.env`** (frontend), solo si vas a usar el login con Google:

```bash
cp brunchie_design/.env.example brunchie_design/.env
```

y pon tu `VITE_GOOGLE_CLIENT_ID`.

---

## 4. Crear la base de datos e instalar

```bash
createdb brunch_db      # o CREATE DATABASE brunch_db; desde psql
npm run setup
```

`npm run setup` instala las dependencias, aplica las migraciones y siembra el administrador y el menú inicial (4 categorías, 12 productos). Es idempotente: puedes repetirlo sin duplicar datos.

---

## 5. Levantar la aplicación

```bash
npm run dev
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:8080**

Para detener: `Ctrl + C`.

Si algo falla, ejecuta `npm run check`: revisa versión de Node, dependencias, variables de entorno, conexión a PostgreSQL, migraciones pendientes y Redis, e indica exactamente qué falta.

---

## 6. Funcionalidades

### 6.1 Cuentas
- Registro e inicio de sesión con correo y contraseña (cifrada con bcrypt).
- Inicio de sesión con Google. El servidor verifica el token contra Google: nunca confía en el correo que envía el navegador.
- Verificación en dos pasos (2FA) opcional: código de 6 dígitos por correo, válido 5 minutos, de un solo uso, que se invalida tras 5 intentos fallidos.
- Cambio de contraseña desde el perfil.

### 6.2 Menú
Catálogo por categorías, buscador, modal de detalle y favoritos. Las imágenes se suben a Cloudinary desde el panel de administración.

### 6.3 Pedidos
El usuario arma su carrito y paga en el checkout indicando dirección, teléfono, método de pago y notas. **No hace falta tener cuenta para pedir**, pero si inicias sesión el pedido queda asociado a ti y puedes seguir su estado en tiempo real desde el perfil.

**Pedidos programados:** cualquiera puede elegir fecha y hora de entrega. El horario lo valida el servidor: lunes a viernes de 8:00 a 16:00, sábados de 9:00 a 16:00; los domingos no hay entregas.

### 6.4 Reservas
Reserva de mesa indicando fecha futura, hora, número de personas y ocasión. Llega un correo de confirmación y el usuario puede cancelar sus propias reservas desde `/reservas`.

### 6.5 Panel de administración (`/admin`)
Solo para usuarios con rol ADMIN. Pestañas:

- **Productos** — crear, editar y eliminar platos, con imagen y disponibilidad.
- **Reservas** — tabla y vista de calendario, cambio de estado y eliminación, exportación a CSV.
- **Pedidos** — cambio de estado (Pendiente → En preparación → En camino → Entregado / Cancelado), exportación a CSV.
- **Reportes** — ingresos, pedidos por estado, métodos de pago y reservas por ocasión.
- **Actividad** — registro de auditoría de las acciones administrativas.

Los pedidos y reservas nuevos aparecen **en vivo**, sin recargar.

### 6.6 Contacto
Formulario en `/contact` que guarda los mensajes en la base de datos.

---

## 7. Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/usuarios/registro`, `/login`, `/google-login`, `/2fa/enviar`, `/2fa/verificar` | Público |
| `PATCH` | `/api/usuarios/{id}/password`, `/{id}/2fa?activo=` | El propio usuario |
| `GET` | `/api/categorias`, `/api/menu`, `/api/menu/{id}` | Público |
| `POST` | `/api/pedidos` | Público (si hay sesión, queda asociado) |
| `GET` | `/api/pedidos/usuario/{id}` | El propio usuario |
| `POST` | `/api/reservas` | Con sesión |
| `GET` | `/api/reservas/usuario/{id}` | El propio usuario |
| `DELETE` | `/api/reservas/{id}` | El dueño de la reserva |
| `POST` | `/api/contacto` | Público |
| — | `/api/admin/menu`, `/api/admin/pedidos`, `/api/admin/reservas` | Solo ADMIN |

Todas las rutas protegidas esperan la cabecera `Authorization: Bearer <token>`.

---

## 8. Alternativa con Docker

```bash
cp .env.example .env     # completa POSTGRES_PASSWORD y JWT_SECRET
docker compose up --build
```

Levanta PostgreSQL, Redis, la API y el frontend servido por nginx en **http://localhost**. Para detener: `docker compose down`.

---

## 9. Problemas comunes

**`npm run dev` falla diciendo que falta una variable**
→ Falta completar `api/.env`. Ejecuta `npm run check` para ver cuál.

**"No se pudo conectar a PostgreSQL"**
→ PostgreSQL no está corriendo o `DATABASE_URL` apunta a otra base. Ojo: debe empezar por `postgresql://`, no por `jdbc:`.

**"Faltan tablas en la base"**
→ `npm run db:migrate` y luego `npm run db:seed`.

**El puerto 8080 está ocupado**
→ Cambia `PORT` en `api/.env` y el destino del proxy en `brunchie_design/vite.config.js`.

**Los correos de 2FA no llegan**
→ Sin `MAIL_USER`/`MAIL_PASSWORD` no se envían correos: el código aparece en la consola del backend. Con Resend, el plan gratuito solo permite enviar a la dirección verificada de la cuenta.

**El panel no actualiza en vivo**
→ Revisa la consola del navegador: el WebSocket necesita sesión válida; si el token expiró, vuelve a iniciar sesión.

**Redis no está corriendo**
→ No pasa nada: el límite de peticiones usa memoria. Solo el 2FA se detiene si `REDIS_URL` está configurada pero Redis no responde; déjala vacía para trabajar sin Redis.
