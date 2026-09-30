import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { arrancar } from "./arranque.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ_PROYECTO = path.join(AQUI, "..");

// En desarrollo se trabaja contra el código del repositorio; empaquetado, contra
// lo que el instalador dejó dentro de la aplicación.
const empaquetado = app.isPackaged;
const raizApi = empaquetado ? path.join(process.resourcesPath, "app.asar", "api") : path.join(RAIZ_PROYECTO, "api");
const directorioEstatico = empaquetado
  ? path.join(process.resourcesPath, "app.asar", "ui")
  : path.join(RAIZ_PROYECTO, "comandas", "dist");

// Con Vite delante se conserva la recarga en caliente al desarrollar.
const urlDesarrollo = process.env.BRUNCH_DEV_URL || null;

// En desarrollo este proceso hace además de API para los servidores de Vite: la
// web pública (5173) y la app de comandas (5174). Sin sus orígenes en la lista,
// el WebSocket los rechaza y se quedan sin tiempo real. Empaquetado no aplica:
// allí la interfaz se sirve desde el propio puerto.
const origenesExtra = empaquetado
  ? []
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"];

let ventana = null;
let servidor = null;

// Dos copias peleándose por el mismo puerto es el fallo más tonto y más probable.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!ventana) return;
    if (ventana.isMinimized()) ventana.restore();
    ventana.focus();
  });

  app.whenReady().then(iniciar);
}

async function iniciar() {
  try {
    servidor = await arrancar({
      rutaConfig: path.join(app.getPath("userData"), "config.env"),
      raizApi,
      directorioEstatico,
      envDesarrollo: empaquetado ? null : path.join(RAIZ_PROYECTO, "api", ".env"),
      urlDesarrollo,
      origenesExtra,
    });
  } catch (err) {
    mostrarError({
      titulo: err.titulo ?? "El programa no pudo iniciarse",
      detalle: err.detalle ?? err.message,
      consejos: err.consejos ?? [],
    });
    return;
  }

  console.log(`✔ Servidor en ${servidor.url}`);
  for (const dir of servidor.direcciones) console.log(`  Para los meseros: ${dir.url}  (${dir.nombre})`);

  abrirVentana(urlDesarrollo ?? servidor.url);
}

function abrirVentana(url) {
  ventana = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#faf8f5",
    title: "Montis Plaza · Comandas",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  ventana.once("ready-to-show", () => ventana.show());
  ventana.on("closed", () => (ventana = null));

  // Cualquier enlace externo se abre en el navegador del sistema, no dentro de
  // la aplicación: aquí solo vive la app del salón.
  ventana.webContents.setWindowOpenHandler(({ url: destino }) => {
    shell.openExternal(destino);
    return { action: "deny" };
  });

  ventana.loadURL(url);
}

function mostrarError(fallo) {
  // También a la consola: si alguien arranca desde una terminal para diagnosticar,
  // el motivo tiene que quedar escrito en algún sitio.
  console.error(`✖ ${fallo.titulo}\n  ${fallo.detalle}`);

  const ventanaError = new BrowserWindow({
    width: 620,
    height: 460,
    resizable: false,
    backgroundColor: "#faf8f5",
    title: "Montis Plaza · Comandas",
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  ventanaError.loadFile(path.join(AQUI, "ventanas", "error.html"), {
    search: new URLSearchParams({
      titulo: fallo.titulo,
      detalle: fallo.detalle ?? "",
      consejos: JSON.stringify(fallo.consejos ?? []),
    }).toString(),
  });
}

app.on("window-all-closed", () => app.quit());

app.on("before-quit", async () => {
  if (servidor) await servidor.cerrar();
});
