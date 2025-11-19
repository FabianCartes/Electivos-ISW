import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { findUserByRut } from "./user.service.js"; // asegurate de importar la búsqueda por RUT

export async function loginUser(rut, password) {
  // buscamos al usuario por su RUT
  const user = await findUserByRut(rut);

  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  // comparamos la contraseña
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  // creamos el Token
  // agregamos datos utiles al payload (rol, nombre, rut)
  const payload = { 
    sub: user.id, 
    email: user.email, 
    rut: user.rut,
    role: user.role,
    nombre: user.nombre
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || "tu_secreto_temporal", { expiresIn: "2h" });

  return { user, token };
}