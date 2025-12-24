import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { InscripcionService } from "../services/inscripcion.service.js";

const service = new InscripcionService();

export async function handleCreateInscripcion(req, res) {
	try {
    // Obtener el ID del alumno desde el token JWT
    // El payload usa 'sub' como id; dejamos 'id' como fallback por compatibilidad
    const alumnoId = req.user?.sub ?? req.user?.id;
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

// GET /inscripcion/electivo/:electivoId  (PROFESOR - Ver alumnos inscritos en sus electivos)
export async function handleGetInscripcionesPorElectivo(req, res) {
  try {
    const { electivoId } = req.params;
    
    // Validar que electivoId es un número válido
    if (!electivoId || Number.isNaN(Number(electivoId))) {
      return handleErrorClient(res, 400, "electivoId es requerido y debe ser numérico");
    }
    
    const profesorId = req.user.sub;

    const inscripcionRepo = AppDataSource.getRepository(Inscripcion);
    const electivoRepo = AppDataSource.getRepository(Electivo);

    // Verificar que el electivo existe y pertenece al profesor
    const electivo = await electivoRepo.findOne({
      where: { id: Number(electivoId) },
      relations: ["profesor"]
    });

    if (!electivo) {
      return handleErrorClient(res, 404, "Electivo no encontrado");
    }

    if (electivo.profesor.id !== profesorId) {
      return handleErrorClient(res, 403, "No tienes permiso para ver las inscripciones de este electivo");
    }

    // Obtener inscripciones
    const inscripciones = await inscripcionRepo.find({
      where: { electivoId: Number(electivoId) },
      relations: ["alumno", "electivo"],
      order: { id: "DESC" }
    });

    return handleSuccess(res, 200, "Inscripciones obtenidas", inscripciones);
  } catch (error) {
    return handleErrorServer(res, 500, "Error al obtener inscripciones", error.message);
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

    const updated = await service.cambiarEstado(Number(id), status, motivo_rechazo);
    return handleSuccess(res, 200, "Estado de inscripción actualizado", updated);
  } catch (err) {
    if (err.name === "ValidationError") return handleErrorClient(res, 400, err.message);
    return handleErrorServer(res, 500, err.message);
  }
}
