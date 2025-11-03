import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const { email, password, nombre, role } = data ?? {};

  // Validaciones básicas: no nulos/strings vacíos
  if (!email || !email.toString().trim() ||
      !password || !password.toString().trim() ||
      !nombre || !nombre.toString().trim() ||
      !role || !role.toString().trim()) {
    throw new Error("Campos requeridos: email, password, nombre, role");
  }

  // Validar role permitido
  const allowedRoles = ["ALUMNO", "PROFESOR", "JEFE_CARRERA"];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Role inválido. Debe ser uno de: ${allowedRoles.join(", ")}`);
  }

  const hashedPassword = await bcrypt.hash(password.toString(), 10);

  const newUser = userRepository.create({
    email: email.toString().trim(),
    password: hashedPassword,
    nombre: nombre.toString().trim(),
    role,
  });

  const saved = await userRepository.save(newUser);

  // No devolver la contraseña al caller
  const result = { ...saved };
  delete result.password;
  return result;
}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}
export async function updateUser(id, { email, password }) {
  const user = await userRepository.findOneBy({ id });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (email && email.trim()) {
    user.email = email.trim();
  }

  if (password && password.trim()) {
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
  }

  return await userRepository.save(user);
}
export async function deleteUser(id) {
  const user = await userRepository.findOneBy({ id });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  await userRepository.delete(id);
  return true;
}