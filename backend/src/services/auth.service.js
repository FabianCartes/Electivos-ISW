import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { findUserByRut } from "./user.service.js";

export async function loginUser(rut, password) {
  // buscamos al usuario por su rut
  const user = await findUserByRut(rut);

  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  // compara la contraseña
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  // crea el Token
  // agrega datos utiles al payload (rol, nombre, rut)
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