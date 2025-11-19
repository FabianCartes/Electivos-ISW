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

