# Manual de instalación y uso — Montis Plaza

Este manual lleva de un equipo vacío a tener el sistema funcionando, y después explica cómo se usa en el día a día del restaurante.

El proyecto son **dos aplicaciones** sobre una misma API y una misma base de datos:

| Aplicación | Para quién | Dónde se abre |
|---|---|---|
| **Web pública** | Clientes | Navegador, `http://localhost:5173` |
| **Comandas** | Personal del salón | Aplicación de escritorio en el PC del local, y el celular de los meseros por WiFi |

---

## 1. Requisitos

| Herramienta | Versión | Descarga |
|---|---|---|
| Node.js | 20 o superior (recomendado 22) | https://nodejs.org |
| PostgreSQL | 15 o superior | https://www.postgresql.org/download/ |
| Git | Cualquiera | https://git-scm.com |

Hay un archivo `.nvmrc` en la raíz: si usas `nvm`, con `nvm use` te pones en la versión correcta.

**Redis es opcional.** Sin él, el límite de peticiones y los códigos de verificación funcionan en memoria. No hace falta instalarlo para trabajar.

> **Al instalar PostgreSQL, apunta la contraseña del usuario `postgres`.** La vas a necesitar en el paso 3 y no se puede recuperar después sin reinstalar.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/HankPawa/Brunchidik.git
cd Brunchidik
```

---

## 3. Configurar las credenciales

Las credenciales **no viajan en el repositorio**: cada equipo crea las suyas a partir de las plantillas.

```bash
cp api/.env.example api/.env
```

Abre `api/.env` y completa:

| Variable | Qué poner |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:TU_CONTRASEÑA@localhost:5432/brunch_db?schema=public` |
| `JWT_SECRET` | Una cadena aleatoria de 32 caracteres o más. Genérala con el comando de abajo |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | El administrador que quieres que se cree |
| `MESERO_EMAIL` / `MESERO_PASSWORD` | La cuenta del mesero |
| `COCINA_EMAIL` / `COCINA_PASSWORD` | La cuenta de la cocina |

Para generar el `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Si la contraseña de PostgreSQL tiene caracteres como `@`, `:`, `/` o `#`**, hay que escribirlos en forma codificada dentro de `DATABASE_URL` (`@` es `%40`, `#` es `%23`). Si no, la dirección se parte por donde no debe y la conexión falla con un error confuso.

El frontend solo necesita su propio `.env` si vas a usar el inicio de sesión con Google o si el salón corre en otra máquina:

```bash
cp brunchie_design/.env.example brunchie_design/.env
```

| Variable | Para qué |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Inicio de sesión con Google |
| `VITE_COMANDAS_URL` | A dónde lleva el botón «Ir al salón» del panel de admin. En el local, la IP del PC servidor |

---

## 4. Instalar y preparar la base de datos

Un solo comando, desde la raíz:

```bash
npm run setup
```

Hace cinco cosas, en orden:

1. Instala las dependencias de los **cinco** proyectos (`raíz`, `api`, `brunchie_design`, `comandas`, `escritorio`).
2. **Crea la base de datos** si no existe.
3. Aplica las migraciones.
4. Siembra el administrador, el personal, el menú y las mesas.
5. Deja todo listo para arrancar.

> La instalación descarga Electron (unos 100 MB) para la aplicación de escritorio. La primera vez tarda.

**No hace falta `createdb` ni `psql`.** En Windows, el instalador de PostgreSQL no añade sus herramientas al PATH, así que esos comandos no existen en la terminal. El paso de crear la base se hace desde Node con la conexión de `api/.env`.

Si algo falla:

```bash
npm run check
```

Revisa la versión de Node, las dependencias de los cuatro proyectos, el archivo `.env`, la conexión a PostgreSQL, las migraciones pendientes y Redis, y dice exactamente qué falta.

---

## 5. Arrancar

### Para desarrollar

```bash
npm run dev
```

Levanta las tres cosas a la vez:

| Qué | Dirección |
|---|---|
| Web pública | http://localhost:5173 |
| Comandas | http://localhost:5174 |
| API | http://localhost:8080 |

Para detener: `Ctrl + C`.

También puedes levantar solo una: `npm run dev:api`, `npm run dev:web` o `npm run dev:comandas`.

### Para usarlo en el restaurante

```bash
npm run escritorio
```

Compila la interfaz del salón y abre **la aplicación de escritorio**: una ventana propia, sin navegador ni terminal, con el servidor dentro. Es lo que se deja abierto en el PC del local.

Al arrancar imprime algo así:

```
✔ Servidor en http://127.0.0.1:8080
  Para los meseros: http://192.168.1.45:8080  (Wi-Fi)
```

Esa segunda dirección es la que **los meseros abren en el celular**, conectados al mismo WiFi. No instalan nada: desde el navegador, «Añadir a pantalla de inicio» y les queda como un icono más.

> La dirección cambia si el router asigna otra IP. Para que no pase, reserva la IP del PC en el router (reserva DHCP).

---

## 6. Primer arranque: cuentas y roles

La semilla crea tres cuentas con las credenciales que pusiste en `api/.env`:

| Rol | Qué puede hacer | Entra directo a |
|---|---|---|
| **ADMIN** | Todo: carta, inventario, recetas, mesas, reportes y caja | `/admin` |
| **MESERO** | Abrir mesas, tomar y enviar comandas, cobrar | `/mesas` |
| **COCINA** | Ver la cola y marcar los platos | `/cocina` |

El rol se comprueba **leyéndolo de la base en cada petición**, no del token. Si le cambias el rol a alguien, pierde el acceso al instante, sin esperar a que caduque su sesión.

El administrador entra también a la web pública con la misma cuenta, donde ve el panel de pedidos y reservas.

---

## 7. Cómo se usa en el salón

### 7.1 El mesero

1. Entra desde el celular a la dirección del PC.
2. Toca una mesa libre: se abre la cuenta.
3. **+ Agregar** → elige los platos. Tocar el mismo plato varias veces **sube la cantidad**, no crea renglones repetidos; si le pones una nota distinta (por ejemplo «sin cilantro»), va aparte, porque para la cocina es otro plato.
4. **Enviar** manda a cocina lo que aún no se envió. Ese es el momento en que **se descuenta el inventario**.
5. Cuando la cuenta está lista, **Cobrar** y se elige el método de pago.

### 7.2 La cocina

La pantalla muestra dos columnas: **En cola** y **Preparando**, con los minutos que lleva cada plato (se marca en rojo a partir de 15). Los platos aparecen solos al enviarlos, sin recargar. Cada plato se marca **Empezar** y luego **Listo**, uno por uno.

La pantalla pide a Windows que no apague el monitor mientras está abierta.

### 7.3 El inventario

Cada plato puede tener una **receta**: qué insumos gasta y cuánto. Al enviar a cocina, se descuenta automáticamente.

- **Un plato sin receta se vende igual**, pero no descuenta nada. La pantalla de Recetas avisa cuántos platos están en esa situación.
- **Si no hay existencias, no se bloquea la venta**: el stock queda en negativo y se marca en rojo. Un restaurante no puede dejar de servir porque el inventario esté mal cargado, pero tiene que enterarse.
- **Al cancelar un plato ya enviado se devuelve lo que se descontó**, leyéndolo del libro de movimientos y no de la receta. Si la receta cambió entre medias, se devuelve lo que de verdad salió.

### 7.4 El arqueo de caja

En **Admin → Caja**. Uno al día:

1. **Abrir caja** con el dinero que haya en el cajón (la base).
2. Durante el servicio, la pantalla muestra **lo que debería haber**, y se actualiza sola cada vez que se cobra una mesa.
3. Las **entradas** y **salidas** de dinero que no son ventas (pagar al proveedor, retirar para consignar) se registran con su concepto, que es obligatorio.
4. **Cerrar caja**: se cuenta el dinero de verdad y se escribe. La diferencia se calcula sola mientras escribes.

Detalles que importan:

- Solo puede haber **una caja abierta a la vez**. Lo impide la base de datos, no la pantalla.
- Los movimientos **no se borran, se anulan**: un apunte que desaparece sin rastro es lo que después nadie puede justificar.
- Al cerrar, lo esperado **se congela**. Si alguien edita una comanda después, el arqueo de ese día no cambia.
- El efectivo arrastra la base y los movimientos; tarjeta y transferencia se muestran aparte, para cuadrar contra el datáfono y contra el banco.

---

## 8. Comandos

| Comando | Qué hace |
|---|---|
| `npm run setup` | Instalación completa desde cero |
| `npm run dev` | API + web pública + comandas |
| `npm run dev:api` / `dev:web` / `dev:comandas` | Solo uno |
| `npm run escritorio` | Compila comandas y abre la aplicación de escritorio |
| `npm run check` | Diagnóstico: dice qué falta |
| `npm run db:create` | Crea la base de datos si no existe |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Siembra admin, personal, menú y mesas (se puede repetir) |
| `npm run build` | Compila los dos frontends |
| `npm run lint` | ESLint sobre los dos frontends |

---

## 9. Alternativa con Docker

Cubre **solo la API y la web pública**; la aplicación de escritorio no va en contenedor.

```bash
cp .env.example .env     # completa POSTGRES_PASSWORD y JWT_SECRET
docker compose up --build
```

Levanta PostgreSQL, Redis, la API y la web con nginx en **http://localhost**. Para detener: `docker compose down`.

---

## 10. Problemas comunes

Estos son los que de verdad aparecen, con lo que los causa.

**`createdb: command not found` (o `no se reconoce como un comando`)**
→ En Windows las herramientas de PostgreSQL no están en el PATH. No hace falta: usa `npm run db:create`, que hace lo mismo desde Node.

**«No se pudo conectar a PostgreSQL»**
→ El servicio no está corriendo, o `DATABASE_URL` apunta a otro sitio. En Windows, comprueba el servicio `postgresql-x64-17` en *Servicios*. La dirección debe empezar por `postgresql://`, nunca por `jdbc:`.

**La autenticación de PostgreSQL falla y la contraseña es correcta**
→ Si lleva `@`, `#`, `:` o `/`, hay que codificarla dentro de la dirección (`@` → `%40`, `#` → `%23`).

**«Faltan tablas en la base»**
→ `npm run db:migrate` y después `npm run db:seed`.

**El puerto 8080 está ocupado**
→ Suele ser un servidor que quedó abierto en otra terminal. Ciérralo. Si necesitas otro puerto, cámbialo en `api/.env` y en el proxy de `brunchie_design/vite.config.js`.

**La aplicación de escritorio se cierra sola al abrirla desde VSCode**
→ La terminal integrada de VSCode define `ELECTRON_RUN_AS_NODE=1` (el propio editor es Electron) y con esa variable Electron se comporta como Node y no abre ninguna ventana. Por eso se arranca con `npm run escritorio`, que la limpia. Si la lanzas de otra forma, borra esa variable antes.

**La ventana del escritorio abre en blanco**
→ Falta compilar la interfaz: `npm --prefix comandas run build`, o usa `npm run escritorio`, que lo hace solo. Desde la versión actual, el programa avisa de esto con un mensaje en vez de abrir en blanco.

**Los celulares cargan la app pero no se actualiza nada en vivo**
→ Es el fallo más probable al montarlo en otra máquina. El WebSocket valida el `Origin` contra `CORS_ORIGINS`: si falta la dirección desde la que entran, el HTTP funciona pero el tiempo real no. La aplicación de escritorio añade sola las IPs de la red; si levantas la API a mano, añádelas tú en `api/.env`.

**Los celulares no llegan a la dirección del PC**
→ Firewall de Windows. Hay que permitir Node en redes privadas para el puerto 8080. Y comprueba que estén en el mismo WiFi, no en la red de invitados.

**`prisma generate` falla con `EPERM`**
→ Hay un servidor corriendo que tiene bloqueado el motor de Prisma. Párralo y repite.

**Los correos de verificación no llegan**
→ Sin `MAIL_USER` y `MAIL_PASSWORD` no se envía nada: el código aparece en la consola del backend, que para trabajar es suficiente.

**Redis no responde**
→ No pasa nada, salvo para el 2FA. Si `REDIS_URL` está configurada pero Redis no contesta, el 2FA se detiene a propósito: un control de seguridad no puede degradarse en silencio. Deja `REDIS_URL` vacía para trabajar sin Redis.
