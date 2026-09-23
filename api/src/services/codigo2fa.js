import { randomInt, timingSafeEqual } from "node:crypto";
import { store } from "../config/store.js";

const TTL_SEGUNDOS = 300;
const MAX_FALLOS = 5;

const claveCodigo = (usuarioId) => `2fa:codigo:${usuarioId}`;
const claveFallos = (usuarioId) => `2fa:fallos:${usuarioId}`;

export async function generarCodigo(usuarioId) {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await store.secure.set(claveCodigo(usuarioId), codigo, TTL_SEGUNDOS);
  await store.secure.del(claveFallos(usuarioId));
  return codigo;
}

// Un solo uso. Tras MAX_FALLOS intentos erróneos el código se invalida, lo que
// cierra la fuerza bruta sobre los 6 dígitos.
export async function verificarCodigo(usuarioId, codigo) {
  const guardado = await store.secure.get(claveCodigo(usuarioId));
  if (!guardado) return false;

  const recibido = Buffer.from(String(codigo));
  const esperado = Buffer.from(guardado);
  const coincide = recibido.length === esperado.length && timingSafeEqual(recibido, esperado);

  if (coincide) {
    await store.secure.del(claveCodigo(usuarioId));
    await store.secure.del(claveFallos(usuarioId));
    return true;
  }

  const fallos = await store.secure.hit(claveFallos(usuarioId), TTL_SEGUNDOS);
  if (fallos >= MAX_FALLOS) {
    await store.secure.del(claveCodigo(usuarioId));
    await store.secure.del(claveFallos(usuarioId));
  }
  return false;
}
