import { loginUser } from "../services/auth.service.js";
import { authBodyValidation } from "../validations/auth.validation.js"; 
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

//utils para limpiar rut
import { cleanRut } from "../utils/rutUtils.js"; 

//funcion inicio sesion
export async function login(req, res) {
  try {
    //extrae rut y contraseña
    const { rut, password } = req.body;
    
    //limpia el rut
    const rutLimpio = cleanRut(rut); 

    //valida el formato
    if (!rutLimpio) {
        return handleErrorClient(res, 400, "El RUT es obligatorio.");
    }
    
    //con el rut limpio, ahora llama a la funcion
    const { user, token } = await loginUser(rutLimpio, password);

    //crea la cookie
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
  //ordena borrar la cookie 'jwt-auth'
  // envia cookie vacia que expira de inmediato.
  res.cookie("jwt-auth", "", {
    expires: new Date(0),
    httpOnly: false,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    status: "Success",
    message: "Sesión cerrada exitosamente"
  });
}

//validacion del rut
export async function validateRUT(req, res, next) {

    next();
}