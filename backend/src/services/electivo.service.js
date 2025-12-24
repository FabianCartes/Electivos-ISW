import { AppDataSource } from "../config/configDB.js";
import { Electivo } from "../entities/Electivo.js";
import { ElectivoCupo } from "../entities/ElectivoCupo.js"; 
import { HorarioElectivo } from "../entities/HorarioElectivo.js";
import { User } from "../entities/User.js";
import { saveSyllabusPDF, deleteSyllabus, deleteElectivoFolder, getSyllabusPath } from "../utils/fileHandler.js";
import { validateHorarios } from "../utils/horarioUtils.js";

const electivoRepository = AppDataSource.getRepository(Electivo);
const cupoRepository = AppDataSource.getRepository(ElectivoCupo);
const horarioRepository = AppDataSource.getRepository(HorarioElectivo);
const userRepository = AppDataSource.getRepository(User);

export const createElectivo = async (electivoData, profesorId, syllabusPDFFile = null) => {
  const { codigoElectivo, titulo, sala, observaciones, requisitos, ayudante, anio, semestre, cuposList, horarios } = electivoData;

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

  // 2. Validar horarios
  if (!horarios || horarios.length === 0) {
    const error = new Error("Debe agregar al menos un horario.");
    error.status = 400;
    throw error;
  }

  // Validar cada horario (08:10 - 22:00) usando función auxiliar
  validateHorarios(horarios);

  // 3. Crear la instancia del Electivo (sin PDF aún)
  const nuevoElectivo = electivoRepository.create({
    codigoElectivo,
    titulo,
    sala,
    observaciones,
    anio,
    semestre,
    requisitos,
    ayudante,
    status: "PENDIENTE",
    profesor: profesor,
    syllabusPDF: null,
    syllabusName: null,
  });

  // 4. Guardar el Electivo primero
  let electivoGuardado;
  try {
    electivoGuardado = await electivoRepository.save(nuevoElectivo);
  } catch (error) {
    if (error.code === '23505') {
      const constraint = error.constraint || "";
      
      // Mensaje específico para la restricción única de codigoElectivo + año + semestre
      if (
        constraint.includes("codigo") &&
        constraint.includes("anio") &&
        constraint.includes("semestre")
      ) {
        const duplicateError = new Error("Ya existe un electivo con este código en el mismo año y semestre");
        duplicateError.status = 409;
        duplicateError.code = '23505';
        throw duplicateError;
      }
      
      // Mensaje genérico para otras restricciones únicas
      const genericDuplicateError = new Error(
        constraint
          ? `Violación de restricción única (${constraint}).`
          : "Violación de restricción única."
      );
      genericDuplicateError.status = 409;
      genericDuplicateError.code = '23505';
      throw genericDuplicateError;
    }
    throw new Error(`Error al guardar el electivo: ${error.message}`);
  }

  // 4.5 Guardar PDF del syllabus
  if (syllabusPDFFile) {
    try {
      const pdfPath = saveSyllabusPDF(syllabusPDFFile, electivoGuardado.id);
      electivoGuardado.syllabusPDF = pdfPath;
      electivoGuardado.syllabusName = syllabusPDFFile.originalname;
      await electivoRepository.save(electivoGuardado);
    } catch (error) {
      // Si falla guardar PDF, eliminar electivo creado
      await electivoRepository.remove(electivoGuardado);
      throw new Error(`Error al guardar el syllabus: ${error.message}`);
    }
  }

  // 5. Guardar Cupos
  try {
    if (cuposList && cuposList.length > 0) {
      const cuposEntities = cuposList.map(item => {
        return cupoRepository.create({
          carrera: item.carrera,
          cupos: parseInt(item.cupos),
          electivo: electivoGuardado
        });
      });

      await cupoRepository.save(cuposEntities);
    }
  } catch (error) {
    // Eliminar carpeta del electivo (incluyendo archivos del filesystem)
    deleteElectivoFolder(electivoGuardado.id);
    await electivoRepository.remove(electivoGuardado);
    throw new Error(`Error al guardar los cupos: ${error.message}`);
  }

  // 6. Guardar Horarios
  try {
    if (horarios.length > 0) {
      const horariosEntities = horarios.map(item => {
        return horarioRepository.create({
          dia: item.dia,
          horaInicio: item.horaInicio,
          horaTermino: item.horaTermino,
          electivo: electivoGuardado
        });
      });

      await horarioRepository.save(horariosEntities);
    }
  } catch (error) {
    // Eliminar carpeta del electivo (incluyendo archivos del filesystem)
    deleteElectivoFolder(electivoGuardado.id);
    await electivoRepository.remove(electivoGuardado);
    throw new Error(`Error al guardar los horarios: ${error.message}`);
  }

  // 7. Devolver electivo sin PDF
  if (electivoGuardado.profesor) {
    delete electivoGuardado.profesor.password;
  }
  delete electivoGuardado.syllabusPDF;
  return electivoGuardado;
};

// --- OBTENER TODOS (Listar) ---
export const getElectivosByProfesor = async (profesorId) => {
  const electivos = await electivoRepository.find({
    where: { profesor: { id: profesorId } },
    relations: ["cuposPorCarrera", "horarios"],
    order: { id: "DESC" } 
  });
  return electivos.map(electivo => {
    const { syllabusPDF, ...electivoSinPDF } = electivo;
    return electivoSinPDF;
  });
};

// --- OBTENER UNO (Para editar) ---
export const getElectivoById = async (id, profesorId) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(id) },
    relations: ["profesor", "cuposPorCarrera", "horarios"]
  });

  if (!electivo) {
    throw new Error("Electivo no encontrado");
  }

  if (electivo.profesor.id !== profesorId) {
    const error = new Error("No tienes permiso para ver este electivo");
    error.status = 403;
    throw error;
  }
  const { syllabusPDF, ...electivoSinPDF } = electivo;
  return electivoSinPDF;
};

//DESCARGAR PDF
export const descargarSyllabus = async (electivoId) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(electivoId) },
    select: ["id", "syllabusPDF", "syllabusName", "titulo"],
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

  // Obtener ruta absoluta del archivo
  const filePath = getSyllabusPath(electivo.syllabusPDF);
  const filename = electivo.syllabusName || `${electivo.titulo}-syllabus.pdf`;

  return { filePath, filename };
};

// --- ACTUALIZAR ---
export const updateElectivo = async (id, data, profesorId, syllabusPDFFile = null) => {
  const electivo = await electivoRepository.findOne({
    where: { id: Number(id) },
    relations: ["profesor", "cuposPorCarrera", "horarios"]
  });

  if (!electivo) {
    const error = new Error("Electivo no encontrado");
    error.status = 404;
    throw error;
  }

  if (electivo.profesor.id !== profesorId) {
    const error = new Error("No tienes permiso para editar este electivo");
    error.status = 403;
    throw error;
  }

  // Validar horarios si se envían
  if (data.horarios && data.horarios.length > 0) {
    validateHorarios(data.horarios);
  }

  // 1. Actualizamos datos básicos
  electivoRepository.merge(electivo, {
    codigoElectivo: data.codigoElectivo ?? electivo.codigoElectivo,
    titulo: data.titulo ?? electivo.titulo,
    sala: data.sala ?? electivo.sala,
    observaciones: data.observaciones ?? electivo.observaciones,
    anio: data.anio ?? electivo.anio,
    semestre: data.semestre ?? electivo.semestre,
    requisitos: data.requisitos ?? electivo.requisitos,
    ayudante: data.ayudante ?? electivo.ayudante
  });

  // Solo actualizar PDF si se proporcionó uno nuevo
  if (syllabusPDFFile) {
    try {
      // Eliminar PDF anterior si existe
      if (electivo.syllabusPDF) {
        deleteSyllabus(electivo.syllabusPDF);
      }
      
      // Guardar nuevo PDF
      const pdfPath = saveSyllabusPDF(syllabusPDFFile, electivo.id);
      electivo.syllabusPDF = pdfPath;
      electivo.syllabusName = syllabusPDFFile.originalname;
    } catch (error) {
      throw new Error(`Error al actualizar el syllabus: ${error.message}`);
    }
  }

  await electivoRepository.save(electivo);

  // 2. Actualizar cupos
  if (data.cuposList && Array.isArray(data.cuposList)) {
    await cupoRepository.delete({ electivo: { id: parseInt(id) } });

    const nuevosCupos = data.cuposList.map(item => {
      return cupoRepository.create({
        carrera: item.carrera,
        cupos: parseInt(item.cupos),
        electivo: electivo
      });
    });

    await cupoRepository.save(nuevosCupos);
  }

  // 3. Actualizar horarios
  if (data.horarios && Array.isArray(data.horarios)) {
    await horarioRepository.delete({ electivo: { id: parseInt(id) } });

    const nuevosHorarios = data.horarios.map(item => {
      return horarioRepository.create({
        dia: item.dia,
        horaInicio: item.horaInicio,
        horaTermino: item.horaTermino,
        electivo: electivo
      });
    });

    await horarioRepository.save(nuevosHorarios);
  }

  const { syllabusPDF: _, ...electivoSinPDF } = electivo;
  return electivoSinPDF;
};

// --- ELIMINAR ---
export const deleteElectivo = async (id, profesorId) => {
  // Obtener electivo completo (sin excluir PDF)
  const electivo = await electivoRepository.findOne({
    where: { id: Number(id) },
    relations: ["profesor"]
  });

  if (!electivo) {
    const error = new Error("Electivo no encontrado");
    error.status = 404;
    throw error;
  }

  if (electivo.profesor.id !== profesorId) {
    const error = new Error("No tienes permiso para eliminar este electivo");
    error.status = 403;
    throw error;
  }

  // Eliminar archivo del syllabus del filesystem
  if (electivo.syllabusPDF) {
    deleteElectivoFolder(electivo.id);
  }

  // Al tener 'cascade: true' o 'onDelete: CASCADE' en la entidad, 
  // borrar el electivo borrará automáticamente sus cupos y horarios.
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
    relations: ["profesor", "cuposPorCarrera", "horarios"], 
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