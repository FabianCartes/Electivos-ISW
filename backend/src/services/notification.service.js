import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import { sendEmail } from "./email.service.js";
import { normalizeCarrera } from "../utils/carreraUtils.js";

const userRepository = AppDataSource.getRepository(User);

export async function sendEmailToUserId(userId, subject, message) {
  const id = Number(userId);
  if (!id || Number.isNaN(id)) {
    throw new Error("userId inválido");
  }

  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  if (!user.email) {
    throw new Error("El usuario no tiene email registrado");
  }

  await sendEmail({
    to: user.email,
    subject,
    text: message,
  });

  return { sent: 1 };
}

export async function sendEmailToRole(role, subject, message) {
  if (!role) throw new Error("El rol es obligatorio");
  const normalized = role.toString().toUpperCase();
  const allowed = ["ALUMNO", "PROFESOR", "JEFE_CARRERA"];
  if (!allowed.includes(normalized)) {
    throw new Error("Rol no permitido");
  }

  const users = await userRepository.find({
    where: { role: normalized },
    select: ["email"],
  });

  const emails = users.map((u) => u.email).filter(Boolean);
  if (!emails.length) {
    return { sent: 0 };
  }

  await sendEmail({
    to: emails,
    subject,
    text: message,
  });

  return { sent: emails.length };
}

export async function sendEmailToAlumnosByCarrera(rawCarrera, subject, message) {
  if (!rawCarrera) throw new Error("La carrera es obligatoria");
  const carrera = normalizeCarrera(rawCarrera);
  if (!carrera) throw new Error("Carrera inválida");

  const users = await userRepository.find({
    where: { role: "ALUMNO", carrera },
    select: ["email"],
  });

  const emails = users.map((u) => u.email).filter(Boolean);
  if (!emails.length) {
    return { sent: 0 };
  }

  await sendEmail({
    to: emails,
    subject,
    text: message,
  });

  return { sent: emails.length, carrera };
}

export async function notifyPeriodoInicio(periodo) {
  if (!periodo) return { sent: 0 };

  const { anio, semestre, inicio, fin } = periodo;
  const inicioStr = inicio ? new Date(inicio).toLocaleString() : "";
  const finStr = fin ? new Date(fin).toLocaleString() : "";

  const subject = `Ha comenzado el proceso de inscripción ${anio}-${semestre}`;
  const message =
    `Ha comenzado el periodo de inscripción para el año ${anio}, semestre ${semestre}.` +
    (inicioStr && finStr
      ? `\n\nFechas:\nInicio: ${inicioStr}\nFin: ${finStr}`
      : "");

  // Buscar todos los alumnos y profesores
  const users = await userRepository.find({
    where: [{ role: "ALUMNO" }, { role: "PROFESOR" }],
    select: ["email"],
  });

  const emails = users.map((u) => u.email).filter(Boolean);
  if (!emails.length) {
    return { sent: 0 };
  }

  await sendEmail({
    to: emails,
    subject,
    text: message,
  });

  return { sent: emails.length };
}

export async function notifyPeriodoSemanaAntes(periodo) {
  if (!periodo) return { sent: 0 };

  const { anio, semestre, inicio, fin } = periodo;
  const inicioStr = inicio ? new Date(inicio).toLocaleString() : "";
  const finStr = fin ? new Date(fin).toLocaleString() : "";

  const subject = `En una semana comienza el periodo de inscripción ${anio}-${semestre}`;
  const message =
    `En una semana comenzará el periodo de inscripción para el año ${anio}, semestre ${semestre}.` +
    (inicioStr && finStr
      ? `\n\nFechas:\nInicio: ${inicioStr}\nFin: ${finStr}`
      : "");

  const users = await userRepository.find({
    where: [{ role: "ALUMNO" }, { role: "PROFESOR" }],
    select: ["email"],
  });

  const emails = users.map((u) => u.email).filter(Boolean);
  if (!emails.length) {
    return { sent: 0 };
  }

  await sendEmail({
    to: emails,
    subject,
    text: message,
  });

  return { sent: emails.length };
}

export async function notifyPeriodoFin(periodo) {
  if (!periodo) return { sent: 0 };

  const { anio, semestre, inicio, fin } = periodo;
  const inicioStr = inicio ? new Date(inicio).toLocaleString() : "";
  const finStr = fin ? new Date(fin).toLocaleString() : "";

  const subject = `Ha finalizado el proceso de inscripción ${anio}-${semestre}`;
  const message =
    `Ha finalizado el periodo de inscripción para el año ${anio}, semestre ${semestre}.` +
    (inicioStr && finStr
      ? `\n\nFechas del periodo:\nInicio: ${inicioStr}\nFin: ${finStr}`
      : "");

  // Enviamos a alumnos y profesores igual que en las otras notificaciones
  const users = await userRepository.find({
    where: [{ role: "ALUMNO" }, { role: "PROFESOR" }],
    select: ["email"],
  });

  const emails = users.map((u) => u.email).filter(Boolean);
  if (!emails.length) {
    return { sent: 0 };
  }

  await sendEmail({
    to: emails,
    subject,
    text: message,
  });

  return { sent: emails.length };
}
