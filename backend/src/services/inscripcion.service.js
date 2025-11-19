import { AppDataSource } from "../config/configDB.js";
import { Inscripcion } from "../entities/Inscripcion.js";

const inscripcionRepository = AppDataSource.getRepository(Inscripcion);

export async function getInscripcionesPorAlumno(alumnoId) {
  return await inscripcionRepository.find({
    where: { alumno: { id: alumnoId } },
    relations: ["electivo", "electivo.profesor"], // Traemos los datos del electivo y su profe
  });
}