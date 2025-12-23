import { AppDataSource } from "../config/configDB.js";
import { Inscripcion } from "../entities/Inscripcion.js";
import { Electivo } from "../entities/Electivo.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";

export async function handleCreateInscripcion(req, res) {
  try {
    const { electivoId } = req.body ?? {};
    const alumnoId = req.user?.sub;

  
    if (!alumnoId) {
      return handleErrorClient(res, 401, "No autenticado");
    }
    if (!electivoId || Number.isNaN(Number(electivoId))) {
      return handleErrorClient(res, 400, "electivoId es requerido y debe ser numérico");
    }

    const inscripcionRepo = AppDataSource.getRepository(Inscripcion);
    const electivoRepo = AppDataSource.getRepository(Electivo);

    
    const electivo = await electivoRepo.findOne({ where: { id: Number(electivoId) } });
    if (!electivo) {
      return handleErrorClient(res, 404, "El electivo no existe");
    }

    
    const existente = await inscripcionRepo.findOne({
      where: { alumnoId: Number(alumnoId), electivoId: Number(electivoId) },
    });
    if (existente) {
      return handleErrorClient(res, 409, "Ya estás inscrito en este electivo");
    }

    const nueva = inscripcionRepo.create({
      alumnoId: Number(alumnoId),
      electivoId: Number(electivoId),
      status: "PENDIENTE",
    });

    const guardada = await inscripcionRepo.save(nueva);

    return handleSuccess(res, 201, "Inscripción creada exitosamente", guardada);
  } catch (error) {
    // Conflicto por unique (alumnoId, electivoId)
    if (error?.code === "23505") {
      return handleErrorClient(res, 409, "Ya estás inscrito en este electivo");
    }
    return handleErrorServer(res, 500, "Error al crear la inscripción", error.message);
  }
}

// GET /inscripcion/  (JEFE_CARRERA)
export async function handleGetInscripciones(req, res) {
  try {
    const inscripcionRepo = AppDataSource.getRepository(Inscripcion);

    const lista = await inscripcionRepo.find({
      relations: ["alumno", "electivo"],
      order: { id: "ASC" },
    });

    return handleSuccess(res, 200, "Listado de inscripciones", lista);
  } catch (error) {
    return handleErrorServer(res, 500, "Error al obtener inscripciones", error.message);
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

