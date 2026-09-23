import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ApiError, noEncontrado } from "../../lib/errors.js";
import { signToken } from "../../lib/jwt.js";
import { toUsuario } from "../../lib/serialize.js";
import { generarCodigo, verificarCodigo } from "../../services/codigo2fa.js";
import { enviarCodigo2FA } from "../../services/email.js";
import { obtenerPerfilGoogle } from "../../services/google.js";

const SALT_ROUNDS = 10;

const conToken = (usuario) => ({ ...toUsuario(usuario), token: signToken(usuario) });

async function buscarPorId(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw noEncontrado("Usuario no encontrado");
  return usuario;
}

async function mandarCodigo(usuario) {
  const codigo = await generarCodigo(usuario.id);
  await enviarCodigo2FA(usuario.email, codigo);
}

// Con 2FA activo no se emite token todavía: primero hay que verificar el código.
async function iniciarSesion(res, usuario) {
  if (!usuario.dosFaActivo) return res.json(conToken(usuario));

  try {
    await mandarCodigo(usuario);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error(`✖ Error enviando 2FA a ${usuario.email}: ${err.message}`);
  }
  res.json({ requiere2fa: true, usuarioId: Number(usuario.id), email: usuario.email });
}

export async function registrar(req, res) {
  const { nombre, email, password } = req.valid.body;
  const existe = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
  if (existe) throw new ApiError(400, "El correo ya está registrado");

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      dosFaActivo: false,
      cuentaGoogle: false,
      rol: "USUARIO",
    },
  });
  res.json(toUsuario(usuario));
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    throw new ApiError(401, "Credenciales incorrectas");
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: email.trim() } });
  const valida = usuario && (await bcrypt.compare(password, usuario.password));
  if (!valida) throw new ApiError(401, "Credenciales incorrectas");

  await iniciarSesion(res, usuario);
}

export async function loginConGoogle(req, res) {
  const accessToken = typeof req.body?.accessToken === "string" ? req.body.accessToken.trim() : "";
  if (!accessToken) throw new ApiError(400, "Falta el token de Google");

  const perfil = await obtenerPerfilGoogle(accessToken);
  const usuario =
    (await prisma.usuario.findUnique({ where: { email: perfil.email } })) ??
    (await prisma.usuario.create({
      data: {
        nombre: perfil.nombre,
        email: perfil.email,
        password: await bcrypt.hash(randomUUID(), SALT_ROUNDS),
        dosFaActivo: false,
        cuentaGoogle: true,
        rol: "USUARIO",
      },
    }));

  await iniciarSesion(res, usuario);
}

export async function reenviarCodigo(req, res) {
  const usuario = await buscarPorId(req.valid.body.usuarioId);
  try {
    await mandarCodigo(usuario);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error(`✖ Error enviando 2FA a ${usuario.email}: ${err.message}`);
    throw new ApiError(500, "Error al enviar el correo");
  }
  res.type("text/plain").send("Código enviado");
}

export async function verificar(req, res) {
  const { usuarioId, codigo } = req.valid.body;
  if (!(await verificarCodigo(usuarioId, codigo))) {
    throw new ApiError(401, "Código incorrecto o expirado");
  }
  res.json(conToken(await buscarPorId(usuarioId)));
}

export async function cambiarPassword(req, res) {
  const { actual, nueva } = req.valid.body;
  const usuario = await buscarPorId(req.user.id);
  if (!(await bcrypt.compare(actual, usuario.password))) {
    throw new ApiError(401, "Contraseña actual incorrecta");
  }
  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { password: await bcrypt.hash(nueva, SALT_ROUNDS) },
  });
  res.json(toUsuario(actualizado));
}

export async function cambiar2fa(req, res) {
  await buscarPorId(req.user.id);
  const actualizado = await prisma.usuario.update({
    where: { id: req.user.id },
    data: { dosFaActivo: req.valid.query.activo },
  });
  res.json(toUsuario(actualizado));
}
