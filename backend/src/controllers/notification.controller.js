import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import {
  sendEmailToUserId,
  sendEmailToRole,
  sendEmailToAlumnosByCarrera,
} from "../services/notification.service.js";

export async function handleSendEmailToUser(req, res) {
  try {
    const { userId, subject, message } = req.body ?? {};
    if (!userId || !subject || !message) {
      return handleErrorClient(res, 400, "userId, subject y message son requeridos");
    }

    const result = await sendEmailToUserId(userId, subject, message);
    return handleSuccess(res, 200, "Correo enviado al usuario", result);
  } catch (e) {
    return handleErrorServer(res, 500, e.message);
  }
}

export async function handleSendEmailToRole(req, res) {
  try {
    const { role, subject, message } = req.body ?? {};
    if (!role || !subject || !message) {
      return handleErrorClient(res, 400, "role, subject y message son requeridos");
    }

    const result = await sendEmailToRole(role, subject, message);
    return handleSuccess(res, 200, "Correos enviados por rol", result);
  } catch (e) {
    return handleErrorServer(res, 500, e.message);
  }
}

export async function handleSendEmailToAlumnosByCarrera(req, res) {
  try {
    const { carrera, subject, message } = req.body ?? {};
    if (!carrera || !subject || !message) {
      return handleErrorClient(res, 400, "carrera, subject y message son requeridos");
    }

    const result = await sendEmailToAlumnosByCarrera(carrera, subject, message);
    return handleSuccess(res, 200, "Correos enviados a alumnos por carrera", result);
  } catch (e) {
    return handleErrorServer(res, 500, e.message);
  }
}
