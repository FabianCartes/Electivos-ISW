import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { InscripcionService } from "../services/inscripcion.service.js";

const service = new InscripcionService();

export async function handleCreateInscripcion(req, res) {
	try {
		const alumnoId = req.user.id; // viene del token
		const { electivoId, prioridad } = req.body;
		const inscripcion = await service.crearInscripcion({ alumnoId, electivoId, prioridad });
		return handleSuccess(res, 201, "Inscripción creada", inscripcion);
	} catch (err) {
		if (err.name === "ValidationError") return handleErrorClient(res, 400, err.message);
		return handleErrorServer(res, 500, err.message);
	}
}

export async function handleGetInscripciones(req, res) {
	try {
		const { estado, electivoId, alumnoId } = req.query;
		const data = await service.listarInscripciones({ estado, electivoId, alumnoId });
		return handleSuccess(res, 200, "Listado de inscripciones", data);
	} catch (err) {
		return handleErrorServer(res, 500, err.message);
	}
}

// Listar TODAS las inscripciones para el Jefe de Carrera
export async function handleGetTodasInscripciones(req, res) {
	try {
		const data = await service.listarInscripciones({});
		return handleSuccess(res, 200, "Listado total de inscripciones", data);
	} catch (err) {
		return handleErrorServer(res, 500, err.message);
	}
}

// Aprobar inscripción (Jefe de Carrera)
export async function handleAprobarInscripcion(req, res) {
	try {
		const { id } = req.params;
		const updated = await service.cambiarEstado(+id, "APROBADA");
		return handleSuccess(res, 200, "Inscripción aprobada", updated);
	} catch (err) {
		if (err.name === "ValidationError") return handleErrorClient(res, 400, err.message);
		return handleErrorServer(res, 500, err.message);
	}
}

// Rechazar inscripción (Jefe de Carrera)
export async function handleRechazarInscripcion(req, res) {
	try {
		const { id } = req.params;
		const { motivo_rechazo } = req.body;
		const updated = await service.cambiarEstado(+id, "RECHAZADA", motivo_rechazo);
		return handleSuccess(res, 200, "Inscripción rechazada", updated);
	} catch (err) {
		if (err.name === "ValidationError") return handleErrorClient(res, 400, err.message);
		return handleErrorServer(res, 500, err.message);
	}
}
