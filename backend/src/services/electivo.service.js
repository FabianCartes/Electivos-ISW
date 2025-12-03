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


//optener electivos del profesor
export const getElectivosByProfesor = async (profesorId) => {
  return await electivoRepository.find({
    where: { profesor: { id: profesorId } },
    order: { id: "DESC" } // Los más nuevos primero
  });
};

// OBTENER UNO (Para cargar datos al editar) 
export const getElectivoById = async (id, profesorId) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(id) },
    relations: ["profesor"]
  });

  if (!electivo) {
    throw new Error("Electivo no encontrado");
  }

  // Seguridad: Verificar que pertenezca al profesor que lo pide
  if (electivo.profesor.id !== profesorId) {
    const error = new Error("No tienes permiso para ver este electivo");
    error.status = 403;
    throw error;
  }

  return electivo;
};

// actualizar electivo
export const updateElectivo = async (id, data, profesorId) => {
  const electivo = await getElectivoById(id, profesorId); // Reusamos para verificar dueño

  // Actualizamos solo los campos permitidos
  electivoRepository.merge(electivo, {
    titulo: data.titulo,
    descripcion: data.descripcion,
    cupos_totales: data.cupos_totales,
    requisitos: data.requisitos,
    ayudante: data.ayudante
    // Nota: No actualizamos el status, eso lo hace el Jefe de Carrera
  });

  return await electivoRepository.save(electivo);
};

// eliminar electivo
export const deleteElectivo = async (id, profesorId) => {
  const electivo = await getElectivoById(id, profesorId); // Reusamos para verificar dueño
  return await electivoRepository.remove(electivo);
};