import nodemailer from "nodemailer";
import { envs } from "../config/configEnv.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!envs.smtpHost || !envs.smtpUser || !envs.smtpPass) {
    throw new Error("Configuración SMTP incompleta. Define SMTP_HOST, SMTP_USER y SMTP_PASS en el .env");
  }

  const port = envs.smtpPort ?? 587;

  transporter = nodemailer.createTransport({
    host: envs.smtpHost,
    port,
    secure: port === 465, // true para 465, false para otros puertos (587, etc.)
    auth: {
      user: envs.smtpUser,
      pass: envs.smtpPass,
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();

  const from = envs.smtpFrom || envs.smtpUser;
  const mailOptions = {
    from,
    to,
    subject,
    text: text || undefined,
    html: html || (text ? `<p>${text}</p>` : undefined),
  };

  const info = await t.sendMail(mailOptions);
  return info;
}

export async function verifyEmailConfig() {
  const t = getTransporter();
  await t.verify();
  return true;
}
