# Manual de instalación y uso — Brunch & Co.

## Requisitos previos

Instalar las siguientes herramientas antes de comenzar:

| Herramienta | Versión | Descarga |
|---|---|---|
| Java JDK | 17 o superior | https://www.oracle.com/java/technologies/downloads/ |
| Maven | 3.9+ | https://maven.apache.org/download.cgi → Binary zip archive |
| Node.js | 18 o superior | https://nodejs.org → versión LTS |
| Git | Cualquiera | https://git-scm.com |

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

## 2. Configurar Maven en el PATH (Windows)

1. Extraer el ZIP de Maven en `C:\maven`
2. Ir a **Inicio → Variables de entorno del sistema → Path → Nuevo**
3. Agregar: `C:\maven\apache-maven-3.9.15\bin`
4. Abrir un PowerShell nuevo y verificar:

```powershell
mvn -version
```

---

## 3. Configurar permisos de PowerShell (si da error con npm)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Escribir `S` y Enter para confirmar.

---

## 4. Correr el backend (Spring Boot)

Abrir una terminal en la carpeta del proyecto:

```powershell
cd backend
mvn spring-boot:run
```

Esperar hasta ver:

```
Started BrunchApplication in X seconds
Tomcat started on port 8080
```

> El backend se conecta automáticamente a la base de datos en Neon (nube).
> La primera vez que corre, crea todas las tablas y siembra los datos del menú automáticamente.

---

## 5. Correr el frontend (React)

Abrir **otra terminal** (sin cerrar la del backend):

```powershell
cd brunchie_design
npm install
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

---

## 6. Credenciales de prueba

### Usuario administrador
| Campo | Valor |
|---|---|
| Email | `admin@brunch.com` |
| Contraseña | `brunch123` |
| Rol | ADMIN — accede al panel en `/admin` |

### Usuario de prueba
| Campo | Valor |
|---|---|
| Email | `demo@brunch.com` |
| Contraseña | `demo123` |
| Rol | USUARIO |

### Código 2FA (si está activado)
```
123456
```

---

## 7. Estructura del proyecto

```
BrunchDesign/
├── backend/                        ← API Spring Boot (puerto 8080)
│   ├── src/main/java/com/brunch/
│   │   ├── controllers/            ← Endpoints REST
│   │   ├── models/                 ← Entidades JPA
│   │   ├── repositories/           ← Acceso a base de datos
│   │   ├── services/               ← Lógica de negocio
│   │   └── config/                 ← CORS, DataInitializer
│   └── src/main/resources/
│       ├── application.properties          ← Perfil activo
│       ├── application-neon.properties     ← Conexión Neon (nube)
│       └── application-local.properties    ← Conexión local (pgAdmin)
│
└── brunchie_design/                ← Aplicación React (puerto 5173)
    └── src/
        ├── pages/                  ← Vistas principales
        ├── components/             ← Componentes reutilizables
        └── context/                ← Estado global (Auth, Cart)
```

---

## 8. Cambiar entre base de datos local y en la nube

Editar `backend/src/main/resources/application.properties`:

```properties
spring.profiles.active=neon    # Base de datos en Neon (nube) ← recomendado
spring.profiles.active=local   # Base de datos local (pgAdmin)
```

Para usar **local**, crear la base de datos `brunch_db` en pgAdmin y actualizar la contraseña en `application-local.properties`.

---

## 9. Endpoints principales de la API

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/usuarios/registro` | Registro de usuario |
| `POST` | `/api/usuarios/login` | Inicio de sesión |
| `POST` | `/api/usuarios/google-login` | Login con Google |
| `GET` | `/api/categorias` | Menú organizado por categorías |
| `POST` | `/api/reservas` | Crear reserva |
| `POST` | `/api/pedidos` | Crear pedido de domicilio |
| `POST` | `/api/contacto` | Enviar mensaje de contacto |
| `GET` | `/api/admin/menu` | Listar todos los productos (admin) |
| `POST` | `/api/admin/menu` | Agregar producto (admin) |
| `PUT` | `/api/admin/menu/{id}` | Editar producto (admin) |
| `DELETE` | `/api/admin/menu/{id}` | Eliminar producto (admin) |

---

## 10. Solución de problemas comunes

**`mvn` no se reconoce:**
→ Cerrar y abrir una nueva terminal después de agregar Maven al PATH.

**`npm` no se reconoce o da error de permisos:**
→ Ejecutar `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

**El menú aparece vacío:**
→ Verificar que el backend esté corriendo en el puerto 8080.

**Error de conexión a la base de datos:**
→ Verificar que `application.properties` tenga `spring.profiles.active=neon` y que el archivo `application-neon.properties` esté presente.

**El backend dice "Nothing to compile":**
→ Es normal, significa que no hay cambios nuevos. El servidor arranca igual.
