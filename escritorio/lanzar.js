// Electron se comporta como Node a secas si hereda ELECTRON_RUN_AS_NODE, y las
// terminales integradas de VSCode la traen puesta porque el propio editor es
// Electron. Sin limpiarla, `require("electron")` devuelve una ruta en vez de la
// API, `app` llega vacío y el programa muere antes de abrir nada.
import { spawn } from "node:child_process";
import electron from "electron";

const entorno = { ...process.env };
delete entorno.ELECTRON_RUN_AS_NODE;

const hijo = spawn(electron, ["."], { stdio: "inherit", env: entorno });
hijo.on("close", (codigo) => process.exit(codigo ?? 0));
