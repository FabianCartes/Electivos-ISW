import { AppDataSource } from "../config/configDB.js";
import { PeriodoInscripcion } from "../entities/PeriodoInscripcion.js";

const repo = AppDataSource.getRepository(PeriodoInscripcion.options?.name || PeriodoInscripcion);

export async function getPeriodo(anio, semestre) {
  return await repo.findOne({ where: { anio: Number(anio), semestre: String(semestre) } });
}

export async function setPeriodo(anio, semestre, inicio, fin, jefeCarreraId) {
  if (!anio || !semestre || !inicio || !fin) {
    const err = new Error("Se requieren anio, semestre, inicio y fin.");
    err.name = "ValidationError";
    throw err;
  }

  const anioNum = Number(anio);
  const semestreStr = String(semestre);

  const now = new Date();

  const ini = new Date(inicio);
  const finD = new Date(fin);
  if (Number.isNaN(ini.getTime()) || Number.isNaN(finD.getTime())) {
    const err = new Error("Fechas inválidas.");
    err.name = "ValidationError";
    throw err;
  }
  if (ini >= finD) {
    const err = new Error("inicio debe ser anterior a fin.");
    err.name = "ValidationError";
    throw err;
  }

  // No permitir configurar un periodo que ya terminó (fecha de fin en el pasado)
  if (finD.getTime() < now.getTime()) {
    const err = new Error("No puedes configurar un periodo que ya terminó (fecha de fin en el pasado).");
    err.name = "ValidationError";
    throw err;
  }

  // Regla específica: para semestre 1, la fecha de fin no puede ser posterior al 02-08 del año correspondiente
  if (semestreStr === "1") {
    // Usamos el constructor numérico para evitar problemas de parsing/zona horaria
    const maxFirstSemesterEnd = new Date(anioNum, 7, 2, 23, 59, 59); // Mes 7 = agosto (0-based)
    if (finD.getTime() > maxFirstSemesterEnd.getTime()) {
      const err = new Error(`Para el semestre 1, la fecha de término no puede ser posterior al 02-08-${anioNum}.`);
      err.name = "ValidationError";
      throw err;
    }
  }

  // Máximo 60 días de duración del periodo
  const maxDurationMs = 60 * 24 * 60 * 60 * 1000;
  if (finD.getTime() - ini.getTime() > maxDurationMs) {
    const err = new Error("El periodo no puede superar los 60 días.");
    err.name = "ValidationError";
    throw err;
  }

  let entity = await getPeriodo(anio, semestre);
  const replaced = !!entity;
  if (entity) {
    entity.inicio = ini;
    entity.fin = finD;
    entity.jefeCarreraId = Number(jefeCarreraId) || null;
  } else {
    entity = repo.create({
      anio: anioNum,
      semestre: semestreStr,
      inicio: ini,
      fin: finD,
      jefeCarreraId: Number(jefeCarreraId) || null,
    });
  }
  const saved = await repo.save(entity);
  return { periodo: saved, replaced };
}

export async function isInscripcionAbiertaPara(anio, semestre) {
  const p = await getPeriodo(anio, semestre);
  if (!p) return false;
  const now = new Date();
  return now >= new Date(p.inicio) && now <= new Date(p.fin);
}

export async function isPeriodoFinalizadoPara(anio, semestre) {
  const p = await getPeriodo(anio, semestre);
  if (!p) return false;
  const now = new Date();
  return now > new Date(p.fin);
}

// Obtiene el periodo que está activo en este momento (según fecha/hora)
export async function getPeriodoActivo() {
  const now = new Date();
  return await repo
    .createQueryBuilder("p")
    .where("p.inicio <= :now AND p.fin >= :now", { now })
    .orderBy("p.inicio", "DESC")
    .getOne();
}
