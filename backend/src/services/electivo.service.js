import { AppDataSource } from "../config/configDB.js";
import { Electivo } from "../entities/Electivo.js";
import { ElectivoCupo } from "../entities/ElectivoCupo.js"; 
import { User } from "../entities/User.js";

const electivoRepository = AppDataSource.getRepository(Electivo);
const cupoRepository = AppDataSource.getRepository(ElectivoCupo); // cupos
const userRepository = AppDataSource.getRepository(User);

export const createElectivo = async (electivoData, profesorId) => {
  // Desestructuramos los nuevos campos. 'cuposList' es el array de carreras y cupos.
  const { titulo, descripcion, anio, semestre, requisitos, ayudante, cuposList } = electivoData;

  // 1. Validar Profesor
  const profesor = await userRepository.findOneBy({ id: profesorId });

  if (!profesor) {
    const error = new Error("Usuario profesor no encontrado.");
    error.status = 404;
    throw error;
  }

  if (profesor.role !== "PROFESOR") {
    const error = new Error("El usuario no tiene permisos de PROFESOR.");
    error.status = 403;
    throw error;
  }

  // 2. Crear la instancia del Electivo (El "Padre")
  // Nota: Ya no guardamos 'cupos_totales' como un número fijo, se calcula sumando la lista.
  const nuevoElectivo = electivoRepository.create({
    titulo,
    descripcion,
    anio: parseInt(anio),
    semestre: String(semestre),     
    requisitos,   
    ayudante,     
    status: "PENDIENTE",
    profesor: profesor,
  });

  // 3. Guardar el Electivo primero para generar su ID
  let electivoGuardado;
  try {
    electivoGuardado = await electivoRepository.save(nuevoElectivo);
  } catch (error) {
    throw new Error(`Error al guardar el electivo base: ${error.message}`);
  }

  // 4. Guardar los Cupos por Carrera (Los "Hijos")
  try {
    if (cuposList && cuposList.length > 0) {
      // Mapeamos la lista que viene del frontend a entidades de base de datos
      const cuposEntities = cuposList.map(item => {
        return cupoRepository.create({
          carrera: item.carrera,
          cupos: parseInt(item.cupos),
          electivo: electivoGuardado // Conectamos con el padre que acabamos de guardar
        });
      });

      // Guardamos todos los cupos de una vez
      await cupoRepository.save(cuposEntities);
    }
    
    // Devolvemos el electivo completo (limpiando pass del profe)
    if (electivoGuardado.profesor) {
        delete electivoGuardado.profesor.password;
    }
    return electivoGuardado;

  } catch (error) {
    // Si falla guardar los cupos, deberíamos idealmente borrar el electivo creado (rollback manual)
    // Para simplificar, lanzamos el error.
    await electivoRepository.remove(electivoGuardado); 
    throw new Error(`Error al guardar los cupos por carrera: ${error.message}`);
  }
};

// --- OBTENER TODOS (Listar) ---
export const getElectivosByProfesor = async (profesorId) => {
  return await electivoRepository.find({
    where: { profesor: { id: profesorId } },
    relations: ["cuposPorCarrera"], // detalle de cupos
    order: { id: "DESC" } 
  });
};

// --- OBTENER UNO (Para editar) ---
export const getElectivoById = async (id, profesorId) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(id) },
    relations: ["profesor", "cuposPorCarrera"] // detalle de cupos
  });

  if (!electivo) {
    throw new Error("Electivo no encontrado");
  }

  if (electivo.profesor.id !== profesorId) {
    const error = new Error("No tienes permiso para ver este electivo");
    error.status = 403;
    throw error;
  }

  return electivo;
};

// --- ACTUALIZAR ---
export const updateElectivo = async (id, data, profesorId) => {
  const electivo = await getElectivoById(id, profesorId); // Verifica dueño

  // 1. Actualizamos datos básicos
  const updateData = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    requisitos: data.requisitos,
    ayudante: data.ayudante
  };
  
  // Solo actualizar anio y semestre si vienen en los datos
  if (data.anio !== undefined) updateData.anio = parseInt(data.anio);
  if (data.semestre !== undefined) updateData.semestre = String(data.semestre);
  
  electivoRepository.merge(electivo, updateData);

  await electivoRepository.save(electivo);

  // 2. Actualizamos la lista de cupos (Estrategia: Borrar y Recrear)
  if (data.cuposList && Array.isArray(data.cuposList)) {
    // A. Borramos los cupos antiguos asociados a este electivo
    await cupoRepository.delete({ electivo: { id: parseInt(id) } });

    // B. Creamos los nuevos
    const nuevosCupos = data.cuposList.map(item => {
      return cupoRepository.create({
        carrera: item.carrera,
        cupos: parseInt(item.cupos),
        electivo: electivo // Relacionamos con el electivo actualizado
      });
    });

    await cupoRepository.save(nuevosCupos);
  }

  return electivo;
};

// --- ELIMINAR ---
export const deleteElectivo = async (id, profesorId) => {
  const electivo = await getElectivoById(id, profesorId);
  // Al tener 'cascade: true' o 'onDelete: CASCADE' en la entidad, 
  // borrar el electivo borrará automáticamente sus cupos.
  return await electivoRepository.remove(electivo);
};

// --- OBTENER ELECTIVOS DISPONIBLES PARA ALUMNOS (Solo APROBADOS) ---
export const getElectivosDisponibles = async () => {
  const electivos = await electivoRepository.find({
    where: { status: "APROBADO" },
    relations: ["cuposPorCarrera", "profesor"], // Incluimos cupos y profesor
    order: { id: "DESC" }
  });

  // Log para debug - verificar que solo se retornen APROBADOS
  console.log(`[getElectivosDisponibles] Encontrados ${electivos.length} electivos APROBADOS`);
  electivos.forEach(e => {
    console.log(`  - ID: ${e.id}, Título: ${e.titulo}, Status: ${e.status}`);
  });

  // Limpiamos datos sensibles del profesor (password)
  return electivos.map(electivo => {
    if (electivo.profesor && electivo.profesor.password) {
      delete electivo.profesor.password;
    }
    return electivo;
  });
};

// --- [JEFE] LISTAR TODOS (NUEVO) ---
export const getAllElectivosAdmin = async () => {
  return await electivoRepository.find({
    // Sin filtro 'where' -> Trae PENDIENTES, APROBADOS y RECHAZADOS
    relations: ["profesor", "cuposPorCarrera"], 
    order: { id: "DESC" } // Los más recientes primero
  });
};

// --- [JEFE] GESTIONAR ESTADO ---
export const manageElectivoStatus = async (id, status, motivo_rechazo = null) => {
  const electivo = await electivoRepository.findOneBy({ id: Number(id) });
  if (!electivo) throw new Error("Electivo no encontrado");

  electivo.status = status;
  if (status === "RECHAZADO") {
    electivo.motivo_rechazo = motivo_rechazo;
  } else {
    electivo.motivo_rechazo = null;
  }

  return await electivoRepository.save(electivo);
};