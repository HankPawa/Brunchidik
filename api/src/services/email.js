import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.mail.enabled
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: { user: env.mail.user, pass: env.mail.password },
    })
  : null;

async function enviar({ to, subject, text }) {
  if (!transporter) {
    console.log(`✉ [correo deshabilitado] Para: ${to} | ${subject}\n${text}\n`);
    return;
  }
  await transporter.sendMail({ from: env.mail.from, to, subject, text });
}

export function enviarCodigo2FA(destinatario, codigo) {
  return enviar({
    to: destinatario,
    subject: "Tu código de verificación — Brunch & Co.",
    text:
      "Hola,\n\n" +
      "Tu código de verificación es:\n\n" +
      `    ${codigo}\n\n` +
      "Este código expira en 5 minutos.\n" +
      "Si no fuiste tú, ignora este mensaje.\n\n" +
      "— Brunch & Co.",
  });
}

const formatoFechaLarga = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function enviarConfirmacionReserva(reserva) {
  const fecha = formatoFechaLarga.format(reserva.fecha);
  const hora = reserva.hora.toISOString().slice(11, 16);
  const ocasion = reserva.ocasion ? `  Ocasion:  ${reserva.ocasion}\n` : "";

  return enviar({
    to: reserva.email,
    subject: "Reserva confirmada — Brunch & Co.",
    text:
      `Hola, ${reserva.nombre}!\n\n` +
      "Tu reserva en Brunch & Co. ha sido registrada con éxito.\n\n" +
      `  Fecha:    ${fecha}\n` +
      `  Hora:     ${hora}\n` +
      `  Personas: ${reserva.personas}\n` +
      ocasion +
      "\nTe esperamos. Si necesitas hacer cambios, contáctanos por WhatsApp.\n\n" +
      "— Brunch & Co.",
  });
}
