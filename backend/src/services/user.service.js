import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/User.js";
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

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

  const hashedPassword = await bcrypt.hash(password.toString(), 10);

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