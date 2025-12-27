import { AppDataSource } from "../config/configDB.js";
import { PeriodoInscripcion } from "../entities/PeriodoInscripcion.js";
import { notifyPeriodoInicio, notifyPeriodoSemanaAntes, notifyPeriodoFin } from "./notification.service.js";

// Ejecutar cada 24 horas: los periodos son largos y no necesitamos chequear cada minuto.
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function initPeriodoNotificationsScheduler() {
  const repo = AppDataSource.getRepository(
    PeriodoInscripcion.options?.name || PeriodoInscripcion
  );

  const checkAndNotify = async () => {
    try {
      const now = new Date();
      const periodos = await repo.find();

      for (const periodo of periodos) {
        const inicio = new Date(periodo.inicio);
        const fin = new Date(periodo.fin);

        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
          continue;
        }

        // 1) Recordatorio una semana antes del inicio
        const semanaAntes = new Date(inicio.getTime());
        semanaAntes.setDate(semanaAntes.getDate() - 7);

        if (
          !periodo.correo_semana_antes_enviado &&
          now >= semanaAntes &&
          now < inicio
        ) {
          try {
            await notifyPeriodoSemanaAntes(periodo);
            periodo.correo_semana_antes_enviado = true;
            await repo.save(periodo);
            console.log(
              `Recordatorio "una semana antes" enviado para periodo ${periodo.anio}-${periodo.semestre}`
            );
          } catch (err) {
            console.error(
              "Error al enviar recordatorio de una semana antes para periodo",
              periodo.id,
              err
            );
          }
        }

        // 2) Notificación de inicio de periodo
        if (
          !periodo.correo_inicio_enviado &&
          now >= inicio &&
          now <= fin
        ) {
          try {
            await notifyPeriodoInicio(periodo);
            periodo.correo_inicio_enviado = true;
            await repo.save(periodo);
            console.log(
              `Correo de inicio enviado para periodo ${periodo.anio}-${periodo.semestre}`
            );
          } catch (err) {
            console.error(
              "Error al enviar correo de inicio para periodo",
              periodo.id,
              err
            );
          }
        }

        // 3) Notificación de fin de periodo
        if (!periodo.correo_fin_enviado && now > fin) {
          try {
            await notifyPeriodoFin(periodo);
            periodo.correo_fin_enviado = true;
            await repo.save(periodo);
            console.log(
              `Correo de fin de periodo enviado para periodo ${periodo.anio}-${periodo.semestre}`
            );
          } catch (err) {
            console.error(
              "Error al enviar correo de fin de periodo",
              periodo.id,
              err
            );
          }
        }
      }
    } catch (error) {
      console.error("Error en el scheduler de periodos:", error);
    }
  };

  // Ejecutar una vez al iniciar y luego periódicamente
  checkAndNotify();
  setInterval(checkAndNotify, CHECK_INTERVAL_MS);

  console.log(
    `Scheduler de notificaciones de periodo iniciado (intervalo: ${CHECK_INTERVAL_MS / (60 * 60 * 1000)} horas)`
  );
}
