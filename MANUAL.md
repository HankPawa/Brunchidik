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

## 2. Levantar la aplicación

Con Docker Desktop abierto, ejecutar desde la raíz del proyecto:

```bash
docker compose up --build
```

Este comando levanta los 6 contenedores de la aplicación:

| Contenedor | Puerto | Descripción |
|---|---|---|
| `usuario-service` | 8081 | Autenticación y usuarios |
| `menu-service` | 8082 | Menú y categorías |
| `pedido-service` | 8083 | Pedidos a domicilio |
| `reserva-service` | 8084 | Reservas de mesa |
| `contacto-service` | 8085 | Formulario de contacto |
| `frontend` | 80 | Aplicación React |

> La primera vez tarda varios minutos descargando las imágenes y compilando.
> Las veces siguientes es más rápido (sin `--build`).

Cuando todos los servicios muestren `Started XxxApplication`, abrir en el navegador:

**http://localhost**

---

## 3. Detener la aplicación

```bash
docker compose down
```

---

## 4. Credenciales de prueba

### Usuario administrador
| Campo | Valor |
|---|---|
| Email | `admin@brunch.com` |
| Contraseña | `brunch123` |
| Rol | ADMIN — accede al panel en `/admin` |

---

## 5. Arquitectura del proyecto

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
└── .env                    ← Variables de entorno (credenciales BD)
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

---

## 6. Endpoints principales de la API

| Método | URL | Servicio | Descripción |
|---|---|---|---|
| `POST` | `/api/usuarios/registro` | usuario-service | Registro de usuario |
| `POST` | `/api/usuarios/login` | usuario-service | Inicio de sesión |
| `POST` | `/api/usuarios/google-login` | usuario-service | Login con Google |
| `GET` | `/api/categorias` | menu-service | Menú por categorías |
| `GET` | `/api/menu` | menu-service | Ítems disponibles |
| `GET` | `/api/admin/menu` | menu-service | Todos los ítems (admin) |
| `POST` | `/api/admin/menu` | menu-service | Agregar producto (admin) |
| `PUT` | `/api/admin/menu/{id}` | menu-service | Editar producto (admin) |
| `DELETE` | `/api/admin/menu/{id}` | menu-service | Eliminar producto (admin) |
| `POST` | `/api/pedidos` | pedido-service | Crear pedido |
| `GET` | `/api/pedidos/usuario/{id}` | pedido-service | Pedidos de un usuario |
| `POST` | `/api/reservas` | reserva-service | Crear reserva |
| `GET` | `/api/reservas/usuario/{id}` | reserva-service | Reservas de un usuario |
| `POST` | `/api/contacto` | contacto-service | Enviar mensaje |

---

## 7. Solución de problemas comunes

**`docker` no se reconoce:**
→ Agregar `C:\Program Files\Docker\Docker\resources\bin` al PATH del sistema y reabrir la terminal.

**El frontend no carga o da error de nginx:**
→ Verificar que todos los microservicios estén corriendo antes de acceder al navegador.

**Error de conexión a la base de datos:**
→ Verificar que el archivo `.env` exista en la raíz con las variables `DB_URL`, `DB_USER` y `DB_PASSWORD`.

**Quiero reconstruir solo el frontend:**
```bash
docker compose up --build frontend
```

**Quiero ver los logs de un servicio específico:**
```bash
docker compose logs -f menu-service
```
