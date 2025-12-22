import { AppDataSource } from "../config/configDB.js";
import { Electivo } from "../entities/Electivo.js";
import { ElectivoCupo } from "../entities/ElectivoCupo.js"; 
import { User } from "../entities/User.js";

const electivoRepository = AppDataSource.getRepository(Electivo);
const cupoRepository = AppDataSource.getRepository(ElectivoCupo); // cupos
const userRepository = AppDataSource.getRepository(User);

export const createElectivo = async (electivoData, profesorId, syllabusPDF = null, syllabusNombre = null) => {
  // Desestructuramos los nuevos campos. 'cuposList' es el array de carreras y cupos.
  const { titulo, descripcion, periodo, requisitos, ayudante, cuposList } = electivoData;

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
    periodo,     
    requisitos,   
    ayudante,     
    status: "PENDIENTE",
    profesor: profesor,
    //agregar el syllabuspdf y nombre
    syllabusPDF: syllabusPDF,
    syllabusNombre: syllabusNombre,
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
    //No devolver el pdf porque es pesado
    const { syllabusPDF, ...electivoSinPDF } = electivoGuardado;
    return electivoSinPDF;

  } catch (error) {
    // Si falla guardar los cupos, deberíamos idealmente borrar el electivo creado (rollback manual)
    // Para simplificar, lanzamos el error.
    await electivoRepository.remove(electivoGuardado); 
    throw new Error(`Error al guardar los cupos por carrera: ${error.message}`);
  }
};

// --- OBTENER TODOS (Listar) ---
export const getElectivosByProfesor = async (profesorId) => {
  const electivos = await electivoRepository.find({
    where: { profesor: { id: profesorId } },
    relations: ["cuposPorCarrera"], // detalle de cupos
    order: { id: "DESC" } 
  });
  //no incluir el pdf
  return electivos.map(electivo => {
    const { syllabusPDF, ...electivoSinPDF } = electivo;
    return electivoSinPDF;
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
  //no devolver pdf
  const { syllabusPDF, ...electivoSinPDF } = electivo;
  return electivoSinPDF;
};
//DESCARGAR PDF
export const descargarSyllabus = async (electroId) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(electroId) },
    select: ["id", "syllabusPDF", "syllabusNombre", "titulo"],
  });

  if (!electivo) {
    const error = new Error("Electivo no encontrado");
    error.status = 404;
    throw error;
  }

  if (!electivo.syllabusPDF) {
    const error = new Error("Este electivo no tiene syllabus disponible");
    error.status = 404;
    throw error;
  }

  // Retornar el PDF y el nombre del archivo
  return {
    syllabusPDF: electivo.syllabusPDF, // Buffer
    syllabusNombre: electivo.syllabusNombre || `syllabus-${electivo.titulo}.pdf`,
  };
};
// --- ACTUALIZAR ---
export const updateElectivo = async (id, data, profesorId, syllabusPDF = null, syllabusNombre = null) => {
  const electivo = await getElectivoById(id, profesorId); // Verifica dueño

  // 1. Actualizamos datos básicos
  electivoRepository.merge(electivo, {
    titulo: data.titulo,
    descripcion: data.descripcion,
    periodo: data.periodo,
    requisitos: data.requisitos,
    ayudante: data.ayudante
  });
  if (syllabusPDF) {
    electivo.syllabusPDF = syllabusPDF;
    electivo.syllabusNombre = syllabusNombre; 
  } else {
    const error = new Error("El syllabus PDF es obligatorio al actualizar.");
    error.status = 400;
    throw error;
  }

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
  //no devolver syllabus
  const{ syllabusPDF, ...electivoSinPDF } = electivo;
  return electivoSinPDF;
};

// --- ELIMINAR ---
export const deleteElectivo = async (id, profesorId) => {
  const electivo = await getElectivoById(id, profesorId);
  // Al tener 'cascade: true' o 'onDelete: CASCADE' en la entidad, 
  // borrar el electivo borrará automáticamente sus cupos.
  return await electivoRepository.remove(electivo);
};