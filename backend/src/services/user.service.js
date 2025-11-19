import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import bcrypt from "bcryptjs";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const { email, password, nombre, role } = data ?? {};

  if (!email?.trim() || !password?.trim() || !nombre?.trim() || !role?.trim()) {
    throw new Error("Campos requeridos: email, password, nombre, role");
  }

  const allowedRoles = ["ALUMNO", "PROFESOR", "JEFE_CARRERA"];
  if (!allowedRoles.includes(role)) {
    throw new Error(
      `Role inválido. Debe ser uno de: ${allowedRoles.join(", ")}`
    );
  }

  const existing = await userRepository.findOne({
    where: { email: email.trim() },
  });
  if (existing) {
    throw new Error("El email ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const newUser = userRepository.create({
    email: email.trim(),
    password: hashedPassword,
    nombre: nombre.trim(),
    role: role, // <- ya no hard-coded
  });

  const saved = await userRepository.save(newUser);
  const result = { ...saved };
  delete result.password;
  return result;
}

export async function findUserByEmail(email) {
  return userRepository.findOne({ where: { email } });
}