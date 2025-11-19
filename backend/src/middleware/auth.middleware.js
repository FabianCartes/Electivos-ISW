import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authMiddleware(req, res, next) {
  //obtiene el token desde la cookie
  let token = req.cookies['jwt-auth'];

  // si no esta en la cookie, vee en el header por seguridad
  if (!token) {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
      }
  }

  //si en ambos lados no hay token, rechaza
  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  try {
    //verifica el token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    //guarda la info del usuario (id, rut, role)
    req.user = payload;
    
    // console.log("Usuario autenticado:", req.user.nombre);
    
    next();
  } catch (error) {
    return handleErrorClient(res, 401, "Token inválido o expirado.", error.message);
  }
}