import { getProfesoresContact, getUsersByRole } from "../services/user.service.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";

export const handleGetProfesores = async (req, res) => {
  try {
    const profesores = await getProfesoresContact();
    return handleSuccess(res, 200, "Listado de profesores", profesores);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
};

export const handleGetUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await getUsersByRole(role);
    return handleSuccess(res, 200, "Listado de usuarios por rol", users);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
};
