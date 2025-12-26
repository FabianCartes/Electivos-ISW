import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Crea el directorio para guardar el Programa del Electivo (PDF)
 * @param {number} electivoId - ID del electivo
 * @returns {string} Ruta absoluta del directorio
 */
export const ensureSyllabusDirectory = (electivoId) => {
  // Validar que electivoId sea un número positivo para evitar path traversal
  const id = Number(electivoId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID de electivo inválido");
  }
  
  const uploadsDir = path.join(__dirname, '../../uploads/electivos', String(id));
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  return uploadsDir;
};

/**
 * Guarda el archivo PDF del Programa del Electivo
 * @param {Object} file - Objeto del archivo (req.file de multer)
 * @param {number} electivoId - ID del electivo
 * @returns {string} Ruta relativa del archivo guardado
 */
export const saveSyllabusPDF = (file, electivoId) => {
  if (!file) {
    throw new Error("No se proporcionó archivo PDF");
  }

  const uploadDir = ensureSyllabusDirectory(electivoId);
  const filename = 'programa-del-electivo.pdf';
  const filePath = path.join(uploadDir, filename);

  // Si el archivo viene de diskStorage, ya está en el filesystem
  if (file.path) {
    // Mover archivo desde la carpeta temporal a la carpeta final
    if (fs.existsSync(file.path)) {
      fs.renameSync(file.path, filePath);
    }
  } else if (file.buffer) {
    // Si el archivo viene de memoryStorage, escribir el buffer
    fs.writeFileSync(filePath, file.buffer);
  } else {
    throw new Error("Formato de archivo no válido para procesar");
  }

  // Retornar ruta relativa para guardar en BD
  return `/uploads/electivos/${electivoId}/${filename}`;
};

/**
 * Obtiene la ruta absoluta del Programa del Electivo (PDF)
 * @param {string} relativePath - Ruta relativa guardada en BD
 * @returns {string} Ruta absoluta
 */
export const getSyllabusPath = (relativePath) => {
  if (!relativePath) {
    throw new Error("Ruta del Programa del Electivo no disponible");
  }

  const absolutePath = path.join(__dirname, '../../', relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error("Archivo del Programa del Electivo no encontrado en el servidor");
  }

  return absolutePath;
};

/**
 * Elimina el Programa del Electivo (PDF) de un electivo
 * @param {string} relativePath - Ruta relativa del archivo
 * @returns {boolean} True si se eliminó correctamente
 */
export const deleteSyllabus = (relativePath) => {
  if (!relativePath) return false;

  let absolutePath;
  try {
    absolutePath = getSyllabusPath(relativePath);
  } catch (error) {
    console.error("Error obteniendo ruta del Programa del Electivo:", error.message);
    return false;
  }

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error eliminando Programa del Electivo:", error.message);
    return false;
  }
};

/**
 * Elimina la carpeta completa del electivo
 * @param {number} electivoId - ID del electivo
 * @returns {boolean} True si se eliminó correctamente
 */
export const deleteElectivoFolder = (electivoId) => {
  try {
    // Validar ID
    const id = Number(electivoId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID de electivo inválido");
    }
    
    const folderPath = path.join(__dirname, '../../uploads/electivos', String(id));

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error eliminando carpeta del electivo:", error.message);
    return false;
  }
};

/**
 * Valida que el archivo sea un PDF válido revisando los magic bytes
 * @param {Object} file - Objeto del archivo
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePDF = (file) => {
  if (!file) {
    return { valid: false, error: "No se seleccionó archivo" };
  }

  // 1. Validación básica (Mimetype y Extensión)
  if (file.mimetype !== 'application/pdf') {
    return { valid: false, error: "El archivo debe ser un PDF" };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "El archivo no debe superar 10MB" };
  }

  // 2. Validación de seguridad (Magic Bytes: %PDF)
  const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]); 
  let header = Buffer.alloc(4); // Preparamos un buffer de 4 bytes

  try {
    if (file.buffer) {
      // CASO A: El archivo está en Memoria RAM
      header = file.buffer.subarray(0, 4);
    } else if (file.path) {
      // CASO B: El archivo está en Disco (diskStorage)
      // Leemos solo los primeros 4 bytes del archivo físico
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, header, 0, 4, 0);
      fs.closeSync(fd);
    }
  } catch (error) {
    console.error("Error leyendo cabecera del archivo:", error);
    // Si falla la lectura profunda, confiamos en el mimetype para no bloquear
    return { valid: true };
  }

  // Comparamos los bytes leídos con la firma de PDF
  if (!header.equals(pdfMagicBytes)) {
    return { valid: false, error: "El archivo no es un PDF válido (verificación de contenido fallida)" };
  }

  return { valid: true };
};
