import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getPeriodo, setPeriodo } from "../services/periodo.service.js";

export async function handleGetPeriodo(req, res) {
  try {
    const { anio, semestre } = req.query;
    if (!anio || !semestre) return handleErrorClient(res, 400, "anio y semestre son requeridos");
    const p = await getPeriodo(Number(anio), String(semestre));
    return handleSuccess(res, 200, "Periodo", p || null);
  } catch (e) {
    return handleErrorServer(res, 500, e.message);
  }
}

export async function handleSetPeriodo(req, res) {
  try {
    const { anio, semestre, inicio, fin } = req.body;
    const saved = await setPeriodo(anio, semestre, inicio, fin);
    return handleSuccess(res, 200, "Periodo configurado", saved);
  } catch (e) {
    const status = e?.name === "ValidationError" ? 400 : 500;
    if (status >= 500) return handleErrorServer(res, status, e.message);
    return handleErrorClient(res, status, e.message);
  }
}
