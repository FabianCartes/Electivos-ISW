import { AppDataSource } from "../config/configDB.js";
import { Electivo } from "../entities/Electivo.js";
import { User } from "../entities/User.js";

const electivoRepository = AppDataSource.getRepository(Electivo);
const userRepository = AppDataSource.getRepository(User);

export const createElectivo = async (electivoData, profesorId) => {
  const { titulo, descripcion, cupos_totales, requisitos, ayudante } = electivoData;

  // 1. Validar que el usuario (profesor) exista y tenga el rol correcto
  // Usamos findOneBy para una sintaxis más limpia
  const profesor = await userRepository.findOneBy({ id: profesorId });

  if (!profesor) {
    const error = new Error("Usuario profesor no encontrado.");
    error.status = 404;
    throw error;
  }

  if (profesor.role !== "PROFESOR") {
    const error = new Error("El usuario no tiene permisos de PROFESOR para crear un electivo.");
    error.status = 403;
    throw error;
  }

  // 2. Crear la nueva instancia del electivo
  const nuevoElectivo = electivoRepository.create({
    titulo,
    descripcion,
    cupos_totales,
    requisitos, 
    ayudante,   //(puede ser null o string)
    status: "PENDIENTE", // Por defecto
    profesor: profesor,  // Relación con la entidad usuario completa
  });

  // 3. Guardar en la base de datos
  try {
    await electivoRepository.save(nuevoElectivo);

    // Limpieza de seguridad: Quitamos la password del profesor antes de devolver el objeto
    if (nuevoElectivo.profesor) {
        delete nuevoElectivo.profesor.password;
    }

    return nuevoElectivo;
  } catch (error) {
    throw new Error(`Error al guardar el electivo: ${error.message}`);
  }
};