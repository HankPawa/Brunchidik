import { env } from "../config/env.js";
import { ApiError } from "../lib/errors.js";

const TIMEOUT_MS = 5000;
const TOKEN_INVALIDO = "Token de Google inválido";

async function llamarGoogle(url, init) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    console.error(`✖ Error contactando a Google: ${err.message}`);
    throw new ApiError(502, "No se pudo verificar el token de Google");
  }
}

// Nunca confiamos en el email que manda el cliente: Google lo confirma a partir
// del access token. Si hay GOOGLE_CLIENT_ID, además exigimos que el token se
// haya emitido para esta app (evita reutilizar tokens de otras aplicaciones).
export async function obtenerPerfilGoogle(accessToken) {
  const perfilRes = await llamarGoogle("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!perfilRes.ok) throw new ApiError(401, TOKEN_INVALIDO);

  const perfil = await perfilRes.json();
  if (!perfil.email || perfil.email_verified === false) throw new ApiError(401, TOKEN_INVALIDO);

  if (env.googleClientId) {
    const infoRes = await llamarGoogle(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!infoRes.ok) throw new ApiError(401, TOKEN_INVALIDO);
    const info = await infoRes.json();
    if (info.aud !== env.googleClientId && info.azp !== env.googleClientId) {
      throw new ApiError(401, TOKEN_INVALIDO);
    }
  }

  return { email: perfil.email, nombre: perfil.name || perfil.email };
}
