import apiClient from './apiClient';

export async function sendEmailToUser({ userId, subject, message }) {
  const { data } = await apiClient.post('/notificaciones/user', {
    userId,
    subject,
    message,
  });
  return data;
}

export async function sendEmailToRole({ role, subject, message }) {
  const { data } = await apiClient.post('/notificaciones/role', {
    role,
    subject,
    message,
  });
  return data;
}

export async function sendEmailToAlumnosByCarrera({ carrera, subject, message }) {
  const { data } = await apiClient.post('/notificaciones/alumnos-carrera', {
    carrera,
    subject,
    message,
  });
  return data;
}
