import { createElectivo } from "../services/electivo.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export const handleCreateElectivo = async (req, res) => {
  try {
    // 1. Extraemos los datos del body (incluyendo los nuevos campos)
    const { titulo, descripcion, cupos, requisitos, ayudante } = req.body;

    // 2. Extraemos el ID del profesor desde el Token (req.user viene del middleware)
    // Nota: El middleware de autenticación debe haber populado req.user
    // Si usaste 'sub' en el payload del token para el ID, esto es correcto.
    const profesorId = req.user.sub;

    if (!profesorId) {
      return handleErrorClient(res, 401, "No autorizado. ID de usuario no encontrado en el token.");
    }

    // 3. Validación básica de campos obligatorios
    // (Ayudante lo dejamos fuera de esta validación porque es opcional)
    if (!titulo || !descripcion || !cupos || !requisitos) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios: titulo, descripcion, cupos o requisitos.");
    }

    // Preparamos el objeto para el servicio
    // Convertimos cupos a número por seguridad
    const electivoData = {
        titulo,
        descripcion,
        cupos_totales: parseInt(cupos),
        requisitos,
        ayudante // Puede ser null o string vacío, el servicio lo manejará
    };

    // 4. Llamamos al servicio para crear el registro en la BD
    const nuevoElectivo = await createElectivo(electivoData, profesorId);

    // 5. Respuesta exitosa
    handleSuccess(res, 201, "Electivo creado exitosamente y pendiente de aprobación.", { electivo: nuevoElectivo });

  } catch (error) {
    // Manejo de errores que vienen del servicio (404 si no existe profe, 403 si no tiene rol, etc)
    const statusCode = error.status || 500;
    
    if (statusCode < 500) {
        return handleErrorClient(res, statusCode, error.message);
    } else {
        return handleErrorServer(res, 500, error.message);
    }
  }
};