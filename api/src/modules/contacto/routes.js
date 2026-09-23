import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { email, texto, textoOpcional } from "../../lib/schemas.js";
import { toMensajeContacto } from "../../lib/serialize.js";
import { nowNaive } from "../../lib/time.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";

const mensajeSchema = z.object({
  nombre: texto("El nombre"),
  email,
  telefono: textoOpcional("El teléfono", 30),
  mensaje: texto("El mensaje", 5000),
});

async function crear(req, res) {
  const mensaje = await prisma.mensajeContacto.create({
    data: { ...req.valid.body, fechaEnvio: nowNaive() },
  });
  res.json(toMensajeContacto(mensaje));
}

export const contactoRouter = Router();
contactoRouter.post("/", rateLimit(3, 60), validate(mensajeSchema), crear);
