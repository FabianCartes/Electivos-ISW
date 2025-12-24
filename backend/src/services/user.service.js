import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);

export async function getProfesoresContact() {
  const list = await userRepository.find({
    where: { role: "PROFESOR" },
    select: ["id", "nombre", "email"],
    order: { nombre: "ASC" },
  });
  return list;
}

export async function getUsersByRole(role) {
  if (!role) throw new Error("El rol es obligatorio");
  const normalized = role.toString().toUpperCase();
  const allowed = ["ALUMNO", "PROFESOR", "JEFE_CARRERA"];
  if (!allowed.includes(normalized)) {
    throw new Error("Rol no permitido");
  }

  const list = await userRepository.find({
    where: { role: normalized },
    select: ["id", "nombre", "email", "role"],
    order: { nombre: "ASC" },
  });
  return list;
}

export async function createUser(data) {
  // extraemos los datos incluyendo el RUT y el ROLE (opcional)
  const { email, rut, password, nombre, role } = data ?? {};

  // validamos campos obligatorios (rut obligatorio)
  if (!email || !rut || !password || !nombre) {
    throw new Error("Campos requeridos: email, rut, password, nombre");
  }

  //verifica si el usuario ya existe por email O por rut
  const existingUser = await userRepository.findOne({
      where: [
          { email: email },
          { rut: rut }
      ]
  });

  if (existingUser) {
      throw new Error("El usuario ya existe (email o rut duplicado)");
  }

  const existing = await userRepository.findOne({
    where: { email: email.trim() },
  });
  if (existing) {
    throw new Error("El email ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const newUser = userRepository.create({
    email: email.toString().trim(),
    rut: rut.toString().trim(),
    password: hashedPassword,
    nombre: nombre.toString().trim(),
    // si el excel trae un rol, se usa. si no, usa "ALUMNO" por defecto
    role: role ? role : "ALUMNO",
  });

  const saved = await userRepository.save(newUser);

  const result = { ...saved };
  delete result.password;
  return result;
}

export async function findUserByRut(rut) {
  return await userRepository.findOneBy({ rut });
}

export async function findUserByEmail(email) {
  return userRepository.findOne({ where: { email } });
}