/**
 * Valida los horarios de un electivo
 * - La hora de inicio no puede ser anterior a 08:10
 * - La hora de término no puede ser posterior a 22:00
 * - La hora de término debe ser posterior a la hora de inicio
 * 
 * @param {Array} horarios - Array de horarios con propiedades dia, horaInicio, horaTermino
 * @throws {Error} Si algún horario no cumple las validaciones
 */
export const validateHorarios = (horarios) => {
  let totalMinutes = 0;

  for (const horario of horarios) {
    const [hInicio, mInicio] = horario.horaInicio.split(':').map(Number);
    const [hTermino, mTermino] = horario.horaTermino.split(':').map(Number);
    const minInicio = hInicio * 60 + mInicio;
    const minTermino = hTermino * 60 + mTermino;
    const minMin8_10 = 8 * 60 + 10;
    const minMax22 = 22 * 60;

    if (minInicio < minMin8_10) {
      const error = new Error("La hora inicio no puede ser anterior a 08:10");
      error.status = 400;
      throw error;
    }

    if (minTermino > minMax22) {
      const error = new Error("La hora termino no puede ser posterior a 22:00");
      error.status = 400;
      throw error;
    }

    if (minTermino <= minInicio) {
      const error = new Error("La hora termino debe ser posterior a la hora inicio");
      error.status = 400;
      throw error;
    }

    totalMinutes += minTermino - minInicio;
  }

  const maxWeeklyMinutes = 6 * 60; // 6 horas semanales
  if (totalMinutes > maxWeeklyMinutes) {
    const error = new Error("Las horas semanales no pueden superar las 6 horas.");
    error.status = 400;
    throw error;
  }
};
