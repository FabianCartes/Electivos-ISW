import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  if (typeof password !== "string" || !password.trim()) {
    throw new Error("Credenciales incorrectas");
  }

  const user = await findUserByEmail(email);
  if (!user || typeof user.password !== "string") {
    throw new Error("Credenciales incorrectas");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  const safeUser = { ...user };
  delete safeUser.password;

  return { user: safeUser, token };
}