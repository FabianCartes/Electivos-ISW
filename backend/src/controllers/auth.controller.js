import { loginUser } from "../services/auth.service.js";
import { authBodyValidation } from "../validations/auth.validation.js"; 
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

//importamos la utilidad para limpiar el RUT
import { cleanRut } from "../utils/rutUtils.js"; 

// Funcion principal de INICIO DE SESIÓN
export async function login(req, res) {
  try {
    // 1. Extraemos el RUT y la contraseña del cuerpo de la petición
    const { rut, password } = req.body;
    
    // 2. Limpiamos el RUT antes de pasarlo al servicio (quita puntos/guion si los tiene)
    const rutLimpio = cleanRut(rut); 

    // 3. Validar el formato (aunque Joi lo hará, es buena práctica)
    if (!rutLimpio) {
        return handleErrorClient(res, 400, "El RUT es obligatorio.");
    }
    
    // 4. Llamamos al servicio con el RUT limpio
    const { user, token } = await loginUser(rutLimpio, password);

    // 5. Establecer la cookie (manteniendo la configuración actual)
    res.cookie("jwt-auth", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false, 
      maxAge: 3600000,
    });

    return handleSuccess(res, 200, "Inicio de sesión exitoso", { user, token });
  } catch (err) {
    return handleErrorClient(res, 401, err.message);
  }
}

export async function logout(req, res) {
  // Para cerrar sesión con cookies, ordenamos borrar la cookie 'jwt-auth'
  // enviando una cookie vacía que expira de inmediato.
  res.cookie("jwt-auth", "", {
    expires: new Date(0), // Fecha en el pasado = Expira ya
    httpOnly: false,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    status: "Success",
    message: "Sesión cerrada exitosamente"
  });
}

// Si necesitas hacer la validación del RUT
export async function validateRUT(req, res, next) {
    // Asegúrate de usar la validación de Joi si aún la necesitas,
    // o usa una validación simple de que el RUT exista.
    next();
}