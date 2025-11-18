import { AppDataSource } from "../config/configDB.js"; 

const electivoRepository = AppDataSource.getRepository("Electivo");
const userRepository = AppDataSource.getRepository("User");


export const createElectivo = async (electivoData, profesorId) => {
  const { titulo, descripcion, cupos_totales } = electivoData;

  // 1. Validar que el usuario (profesor) exista y tenga el rol correcto
  const profesor = await userRepository.findOne({ 
    where: { id: profesorId } 
  });

  if (!profesor) {
    const error = new Error("Usuario profesor no encontrado.");
    error.status = 404; // Not Found
    throw error;
  }

  if (profesor.role !== "PROFESOR") {
    const error = new Error("El usuario no tiene permisos de PROFESOR para crear un electivo.");
    error.status = 403; // Forbidden
    throw error;
  }

  // 2. Crear la nueva instancia del electivo
  const nuevoElectivo = electivoRepository.create({
    titulo,
    descripcion,
    cupos_totales,
    // El 'status' se pondrá 'PENDIENTE' por defecto
    profesor: profesor, 
  });

  // 3. Guardar el nuevo electivo en la base de datos
  try {
    await electivoRepository.save(nuevoElectivo);
    
    // Devolvemos el electivo, pero sin la instancia completa del profesor
    // para no exponer datos sensibles si no es necesario.
    delete nuevoElectivo.profesor; 
    
    return nuevoElectivo;
  } catch (error) {
    throw new Error(`Error al guardar el electivo: ${error.message}`);
  }
};
