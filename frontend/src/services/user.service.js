import apiClient from "./apiClient";

const userService = {
  async getProfesores() {
    const { data } = await apiClient.get("/usuarios/profesores");
    return data?.data || [];
  },
  async getByRole(role) {
    const { data } = await apiClient.get(`/usuarios/rol/${role}`);
    return data?.data || [];
  },
  async getCarreras() {
    const { data } = await apiClient.get('/usuarios/carreras');
    return data?.data || [];
  }
};

export default userService;
