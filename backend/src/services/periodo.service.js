import { AppDataSource } from "../config/configDB.js";
import { PeriodoInscripcion } from "../entities/PeriodoInscripcion.js";

const repo = AppDataSource.getRepository(PeriodoInscripcion.options?.name || PeriodoInscripcion);

export async function getPeriodo(anio, semestre) {
  return await repo.findOne({ where: { anio: Number(anio), semestre: String(semestre) } });
}

export async function setPeriodo(anio, semestre, inicio, fin) {
  if (!anio || !semestre || !inicio || !fin) {
    const err = new Error("Se requieren anio, semestre, inicio y fin.");
    err.name = "ValidationError";
    throw err;
  }
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

  // Máximo 60 días de duración del periodo
  const maxDurationMs = 60 * 24 * 60 * 60 * 1000;
  if (finD.getTime() - ini.getTime() > maxDurationMs) {
    const err = new Error("El periodo no puede superar los 60 días.");
    err.name = "ValidationError";
    throw err;
  }

  let entity = await getPeriodo(anio, semestre);
  if (entity) {
    entity.inicio = ini;
    entity.fin = finD;
  } else {
    entity = repo.create({ anio: Number(anio), semestre: String(semestre), inicio: ini, fin: finD });
  }
  return await repo.save(entity);
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
