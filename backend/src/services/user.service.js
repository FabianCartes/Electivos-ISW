import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  // Ya no extraemos 'role' de la data, solo nombre, email y pass
  const { email, password, nombre } = data ?? {};

  // Validaciones básicas: quitamos la validación del rol
  if (!email || !email.toString().trim() ||
      !password || !password.toString().trim() ||
      !nombre || !nombre.toString().trim()) {
    throw new Error("Campos requeridos: email, password, nombre");
  }

  // Eliminamos la validación de "allowedRoles" porque nosotros lo definimos internamente

  const hashedPassword = await bcrypt.hash(password.toString(), 10);

  const newUser = userRepository.create({
    email: email.toString().trim(),
    password: hashedPassword,
    nombre: nombre.toString().trim(),
    role: "ALUMNO", // <--- Aquí forzamos el rol por defecto
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