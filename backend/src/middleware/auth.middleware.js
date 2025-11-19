import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js"; // Asegúrate de que la ruta sea correcta

export function authMiddleware(req, res, next) {
  // 1. Intentamos obtener el token desde la COOKIE primero (que es como lo configuramos)
  // Nota: req.cookies necesita la librería 'cookie-parser' instalada en index.js
  let token = req.cookies['jwt-auth'];

  // 2. (Opcional) Si no está en la cookie, miramos en el Header por seguridad 
  // (esto es útil si pruebas con Postman sin cookies)
  if (!token) {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
      }
  }

  // 3. Si después de buscar en ambos lados no hay token, rechazamos
  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  try {
    // 4. Verificamos el token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Guardamos la info del usuario (id, rut, role) en la request
    req.user = payload;
    
    // console.log("Usuario autenticado:", req.user.nombre); // Opcional para debugear
    
    next();
  } catch (error) {
    return handleErrorClient(res, 401, "Token inválido o expirado.", error.message);
  }
}