import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { InscripcionService } from "../services/inscripcion.service.js";

const service = new InscripcionService();

// Mapea errores del servicio a mensajes y códigos más claros
function mapInscripcionError(err) {
  const raw = (err?.message || "").toString();
  const isValidation = err?.name === "ValidationError";

  // Defaults
  let status = isValidation ? 400 : 500;
  let message = raw || "Error en la operación de inscripción";
  let details = undefined;

  const m = raw.toLowerCase();

  if (m.includes("inscripción duplicada") || m.includes("duplicada o prioridad")) {
    status = 409;
    message = "Ya existe una inscripción para ese electivo o la prioridad ya fue usada.";
  } else if (m.includes("alumno no tiene carrera") || m.includes("no tiene carrera registrada")) {
    status = 400;
    message = "Tu usuario no tiene una carrera registrada. Contacta a coordinación para actualizar tus datos.";
  } else if (m.includes("no ofrece cupos para tu carrera") || m.includes("no ofrece cupos para la carrera")) {
    status = 400;
    message = "Este electivo no tiene cupos asignados para tu carrera.";
  } else if (m.includes("sin cupos disponibles para esta carrera")) {
    status = 409;
    message = "Cupos agotados para tu carrera en este electivo.";
  } else if (m.includes("electivo no encontrado")) {
    status = 404;
    message = "El electivo indicado no existe.";
  } else if (m.includes("inscripción no encontrada")) {
    status = 404;
    message = "La inscripción indicada no existe.";
  } else if (m.includes("prioridad debe estar entre") || m.includes("faltan campos requeridos")) {
    status = 400;
    message = raw; // es suficientemente claro
  }

  return { status, message, details };
}

export async function handleCreateInscripcion(req, res) {
	try {
    // Obtener el ID del alumno desde el token JWT
    // El payload usa 'sub' como id; dejamos 'id' como fallback por compatibilidad
    const alumnoId = req.user?.sub ?? req.user?.id;
		const { electivoId, prioridad } = req.body;
    const inscripcion = await service.crearInscripcion({ alumnoId, electivoId, prioridad });
    return handleSuccess(res, 201, "Inscripción creada", inscripcion);
	} catch (err) {
    const mapped = mapInscripcionError(err);
    if (mapped.status >= 500) return handleErrorServer(res, mapped.status, mapped.message, mapped.details);
    return handleErrorClient(res, mapped.status, mapped.message, mapped.details);
	}
}

export async function handleGetInscripciones(req, res) {
	try {
    const { estado, electivoId, alumnoId } = req.query;
    // Limitar por carrera del Jefe de Carrera
    const carreraAlumno = req.user?.carrera;
    if (!carreraAlumno) {
      return handleErrorClient(res, 400, "Tu perfil no tiene carrera asignada");
    }
    const data = await service.listarInscripciones({ estado, electivoId, alumnoId, carreraAlumno });
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
		const mapped = mapInscripcionError(err);
		if (mapped.status >= 500) return handleErrorServer(res, mapped.status, mapped.message, mapped.details);
		return handleErrorClient(res, mapped.status, mapped.message, mapped.details);
	}
}

// GET /inscripcion/electivo/:electivoId  (PROFESOR - Ver alumnos inscritos en sus electivos)
export async function handleGetInscripcionesPorElectivo(req, res) {
  try {
    const { electivoId } = req.params;
    const { estado } = req.query;
    
    // Validar que electivoId es un número válido
    if (!electivoId || Number.isNaN(Number(electivoId))) {
      return handleErrorClient(res, 400, "electivoId es requerido y debe ser numérico");
    }
    
    const profesorId = req.user?.sub ?? req.user?.id;
    if (!profesorId) {
      return handleErrorClient(res, 401, "No se pudo identificar al profesor");
    }

    const data = await service.getInscripcionesPorElectivoParaProfesor(profesorId, Number(electivoId), estado);
    return handleSuccess(res, 200, "Inscripciones obtenidas", data);
  } catch (error) {
    const mapped = mapInscripcionError(error);
    if (mapped.status >= 500) return handleErrorServer(res, mapped.status, mapped.message, mapped.details);
    return handleErrorClient(res, mapped.status, mapped.message, mapped.details);
  }
}


export async function handleGetMisInscripciones(req, res) {
  try {
    // Obtenemos el ID del alumno desde el token.
    // Nota: A veces es req.user.sub o req.user.id dependiendo de cómo creaste el token. 
    // Usaremos una validación doble por si acaso.
    const alumnoId = req.user.sub || req.user.id;

    if (!alumnoId) {
        return handleErrorClient(res, 401, "No se pudo identificar al alumno");
    }

    const data = await service.getInscripcionesPorAlumno(alumnoId);
    return handleSuccess(res, 200, "Mis inscripciones obtenidas", data);
  } catch (err) {
    return handleErrorServer(res, 500, err.message);
  }
}

// --- Cambiar estado de inscripción (JEFE_CARRERA) ---
export async function handleChangeInscripcionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, motivo_rechazo } = req.body;

    if (!id) return handleErrorClient(res, 400, "Id de inscripción requerido");
    if (!["APROBADA", "RECHAZADA", "PENDIENTE"].includes(status)) {
      return handleErrorClient(res, 400, "Estado inválido");
    }

		const jefeCarrera = req.user?.carrera;
		if (!jefeCarrera) {
			return handleErrorClient(res, 400, "Tu perfil de Jefe de Carrera no tiene una carrera asignada.");
		}

		const updated = await service.cambiarEstado(Number(id), status, motivo_rechazo, jefeCarrera);
    return handleSuccess(res, 200, "Estado de inscripción actualizado", updated);
  } catch (err) {
		const mapped = mapInscripcionError(err);
		if (mapped.status >= 500) return handleErrorServer(res, mapped.status, mapped.message, mapped.details);
		return handleErrorClient(res, mapped.status, mapped.message, mapped.details);
  }
}
