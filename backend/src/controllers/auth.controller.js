import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import{authBodyValidation} from "../validations/auth.validation.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return handleErrorClient(res, 400, "Email y contraseña son obligatorios");
    }

    const { user, token } = await loginUser(email, password);

    res.cookie("jwt-auth", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      maxAge: 3600000,
    });

    return handleSuccess(res, 200, "Inicio de sesión exitoso", { user, token });
  } catch (err) {
    return handleErrorClient(res, 401, err.message);
  }
}

export async function register(req, res) {
  try {
    const data = req.body;
    
    const {error}= authBodyValidation.validate(req.body)
    if (error){
      return handleErrorClient(res,400,"Parametros invalidos",error.message);
    }
    const newUser = await createUser(data);
    delete newUser.password;
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    if (error.code === '23505') { // Código de error de PostgreSQ
      handleErrorClient(res, 409, "El email ya está registrado");
    } else {
      handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}
