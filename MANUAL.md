# Manual de instalación y uso — Brunch & Co.

## Requisitos previos

| Herramienta | Versión | Descarga |
|---|---|---|
| Docker Desktop | Cualquiera | https://www.docker.com/products/docker-desktop |
| Git | Cualquiera | https://git-scm.com |

> Docker incluye todo lo necesario (Java, Maven, Node.js, nginx). No se requiere instalarlos por separado.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/HankPawa/BrunchDesign.git
cd BrunchDesign
```

Si ya lo tienes clonado, actualiza con:

```bash
git pull origin main
```

---

## 2. Crear el archivo `.env`

El archivo `.env` contiene las credenciales y **no está incluido en el repositorio**. Debe crearse manualmente en la raíz del proyecto cada vez que se clona o limpia el repo.

Crear el archivo `BrunchDesign/.env` con el siguiente contenido:

```env
DB_URL=jdbc:postgresql://ep-morning-pond-apcz3rm8-pooler.c-7.us-east-1.aws.neon.tech/brunch_db?sslmode=require
DB_USER=neondb_owner
DB_PASSWORD=npg_7aSCWVt0YKFG
SPRING_PROFILE=neon
MAIL_USER=resend
MAIL_PASSWORD=re_P2yy2shc_PzAqDvwsKSxr1qQceZ2QwiK4
```

> Sin este archivo, el sistema no puede conectarse a la base de datos ni enviar correos 2FA.

---

## 3. Levantar la aplicación

Con Docker Desktop abierto, ejecutar desde la raíz del proyecto:

```bash
docker compose up --build
```

Este comando levanta los 6 contenedores de la aplicación:

| Contenedor | Puerto | Descripción |
|---|---|---|
| `usuario-service` | 8081 | Autenticación, usuarios, 2FA, suscripción |
| `menu-service` | 8082 | Menú y categorías |
| `pedido-service` | 8083 | Pedidos a domicilio (normales y programados) |
| `reserva-service` | 8084 | Reservas de mesa |
| `contacto-service` | 8085 | Formulario de contacto |
| `frontend` | 80 | Aplicación React + nginx |

> La primera vez tarda varios minutos descargando las imágenes y compilando.  
> Las siguientes veces es más rápido (sin `--build`).

Cuando todos los servicios muestren `Started XxxApplication`, abrir en el navegador:

**http://localhost**

---

## 4. Detener la aplicación

```bash
docker compose down
```

---

## 5. Credenciales de prueba

### Usuario administrador

| Campo | Valor |
|---|---|
| Email | `admin@brunch.com` |
| Contraseña | `brunch123` |
| Rol | ADMIN — accede al panel en `/admin` |

### Usuario de prueba con suscripción activa

| Campo | Valor |
|---|---|
| Email | Registrar uno nuevo desde `/login` |
| Suscripción | Activar desde `/suscripcion` |

---

## 6. Funcionalidades del sistema

### 6.1 Autenticación y usuarios

- **Registro / Login** — formulario con email y contraseña (cifrada con BCrypt).
- **Login con Google** — autenticación OAuth mediante Google.
- **Verificación en dos pasos (2FA)** — el usuario puede activar 2FA desde su perfil. Al hacer login, el sistema envía un código de 6 dígitos al correo del usuario mediante Resend SMTP. El código expira en 5 minutos.
- **Cambio de contraseña** — desde la sección de perfil, ingresando la contraseña actual.
- **Recuperación de contraseña** — flujo por enlace enviado al correo (`/forgot-password` → `/reset-password`).

### 6.2 Menú

- Catálogo de productos organizado por categorías.
- Slider por categoría con paginación.
- Modal de catálogo completo por categoría.
- Animación de sándwich al hacer scroll (GSAP).
- Imágenes optimizadas con lazy loading y skeleton shimmer.

### 6.3 Pedidos

- El usuario agrega productos al carrito y procede al checkout.
- En el checkout ingresa dirección, teléfono, notas y método de pago.
- **Pedido programado (Premium)** — los usuarios con suscripción activa pueden marcar la casilla "Programar pedido para una fecha y hora específica". La hora de entrega debe estar entre las **8:00 AM y las 3:00 PM**.

### 6.4 Suscripción Premium

- Planes disponibles: **Mensual** ($29.900/mes) y **Anual** ($249.900/año).
- El pago se simula con un formulario de tarjeta con validación completa (número 16 dígitos, vencimiento MM/AA, CVV, nombre).
- Al suscribirse, el usuario desbloquea la función de pedidos programados.
- Desde `/suscripcion`, los usuarios no autenticados ven el botón **"Iniciar sesión para suscribirse"**.

### 6.5 Reservas

- El usuario puede crear una reserva indicando fecha futura, hora, número de personas y ocasión.
- El usuario puede cancelar sus reservas activas desde su perfil.
- El administrador puede cambiar el estado de cada reserva (PENDIENTE → CONFIRMADA → CANCELADA) y eliminarlas.

### 6.6 Panel de administración (`/admin`)

Accesible solo con rol ADMIN. Tiene **3 pestañas**:

**Productos**
- Ver todos los productos del menú con nombre, categoría, precio y disponibilidad.
- Agregar producto: nombre, descripción, precio, categoría, imagen (subida directa a Cloudinary o URL) y disponibilidad.
- Editar y eliminar productos existentes.

**Reservas**
- Tabla con columnas: Cliente, Email, Fecha, Hora, Personas, Ocasión, Estado, Acciones.
- Cambiar estado desde un selector (PENDIENTE / CONFIRMADA / CANCELADA).
- Eliminar reservas.

**Pedidos**
- Tabla con columnas: ID, Dirección, Teléfono, Pago, Total, Programado, Estado.
- Cambiar estado desde un selector (PENDIENTE / EN_PREPARACION / EN_CAMINO / ENTREGADO / CANCELADO).
- La columna "Programado" muestra la fecha y hora del pedido programado, o "—" si es inmediato.

### 6.7 Contacto

- Formulario de contacto en `/contact` que envía mensajes al microservicio `contacto-service`.

---

## 7. Arquitectura del proyecto

El backend está dividido en **5 microservicios independientes**, cada uno con su propio servidor, modelos y conexión a base de datos:

```
BrunchDesign/
├── usuario-service/        ← Microservicio de usuarios (puerto 8081)
├── menu-service/           ← Microservicio de menú y categorías (puerto 8082)
├── pedido-service/         ← Microservicio de pedidos (puerto 8083)
├── reserva-service/        ← Microservicio de reservas (puerto 8084)
├── contacto-service/       ← Microservicio de mensajes de contacto (puerto 8085)
├── brunchie_design/        ← Aplicación React (frontend, puerto 80)
├── docker-compose.yml      ← Orquestación de todos los servicios
└── .env                    ← Variables de entorno (NO incluido en el repo)
```

Cada microservicio tiene la misma estructura interna:

```
{servicio}/
├── src/main/java/com/brunch/{dominio}/
│   ├── {Dominio}Application.java   ← Punto de entrada
│   ├── config/                     ← CORS y datos iniciales
│   ├── model/                      ← Entidades JPA
│   ├── repository/                 ← Acceso a base de datos
│   ├── service/                    ← Lógica de negocio
│   └── controller/                 ← Endpoints REST
└── src/main/resources/
    ├── application.properties
    └── application-neon.properties ← Conexión a PostgreSQL (Neon)
```

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, GSAP + ScrollTrigger, React Router |
| Backend | Spring Boot 3.4, Java 21 (Temurin), JPA/Hibernate |
| Base de datos | PostgreSQL — Neon Cloud |
| Proxy / Servidor | nginx (reverse proxy + SPA serving) |
| Orquestación | Docker Compose |
| Correo | Resend SMTP (smtp.resend.com:465 SSL) |
| Imágenes | Cloudinary (cloud: `dwhezsxkg`, preset: `brunch_menu`) |
| CI/CD | GitHub Actions |

---

## 8. Endpoints principales de la API

### Usuarios (`/api/usuarios`)

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/usuarios/registro` | Registro de usuario |
| `POST` | `/api/usuarios/login` | Inicio de sesión |
| `POST` | `/api/usuarios/google-login` | Login con Google |
| `POST` | `/api/usuarios/2fa/enviar` | Enviar código 2FA por correo |
| `POST` | `/api/usuarios/2fa/verificar` | Verificar código 2FA |
| `PATCH` | `/api/usuarios/{id}/2fa?activo=` | Activar / desactivar 2FA |
| `PATCH` | `/api/usuarios/{id}/suscripcion?activo=` | Activar / desactivar suscripción |
| `PATCH` | `/api/usuarios/{id}/password` | Cambiar contraseña |

### Menú (`/api/menu`, `/api/categorias`)

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/api/categorias` | Listar categorías |
| `GET` | `/api/menu` | Ítems disponibles |
| `GET` | `/api/admin/menu` | Todos los ítems (admin) |
| `POST` | `/api/admin/menu` | Agregar producto (admin) |
| `PUT` | `/api/admin/menu/{id}` | Editar producto (admin) |
| `DELETE` | `/api/admin/menu/{id}` | Eliminar producto (admin) |

### Pedidos (`/api/pedidos`)

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/pedidos` | Crear pedido (normal o programado) |
| `GET` | `/api/pedidos/usuario/{id}` | Pedidos de un usuario |
| `GET` | `/api/admin/pedidos` | Todos los pedidos (admin) |
| `PATCH` | `/api/admin/pedidos/{id}/estado?estado=` | Cambiar estado (admin) |

### Reservas (`/api/reservas`)

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/reservas` | Crear reserva |
| `GET` | `/api/reservas/usuario/{id}` | Reservas de un usuario |
| `PATCH` | `/api/reservas/{id}/estado` | Cancelar reserva (usuario) |
| `GET` | `/api/admin/reservas` | Todas las reservas (admin) |
| `PATCH` | `/api/admin/reservas/{id}/estado?estado=` | Cambiar estado (admin) |
| `DELETE` | `/api/admin/reservas/{id}` | Eliminar reserva (admin) |

### Contacto (`/api/contacto`)

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/contacto` | Enviar mensaje de contacto |

---

## 9. Solución de problemas comunes

**`docker` no se reconoce en la terminal:**
→ Agregar `C:\Program Files\Docker\Docker\resources\bin` al PATH del sistema y reabrir la terminal.

**El frontend no carga o da error de nginx:**
→ Verificar que todos los microservicios estén corriendo antes de acceder al navegador.

**Error de conexión a la base de datos:**
→ Verificar que el archivo `.env` exista en la raíz con las variables `DB_URL`, `DB_USER` y `DB_PASSWORD`.

**El correo 2FA no llega:**
→ El plan gratuito de Resend solo permite enviar a la dirección verificada del propietario de la cuenta. Para enviar a cualquier correo, verificar un dominio en resend.com/domains.

**Las imágenes del admin panel no se suben:**
→ Verificar que el preset `brunch_menu` esté creado como **unsigned** en el dashboard de Cloudinary (cloud: `dwhezsxkg`).

**Quiero reconstruir solo el frontend:**
```bash
docker compose up --build frontend
```

**Quiero ver los logs de un servicio específico:**
```bash
docker compose logs -f usuario-service
```

**El archivo `.env` desapareció después de un `git pull`:**
→ Recrearlo manualmente con el contenido de la sección 2 de este manual.
