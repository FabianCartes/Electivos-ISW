import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

function CrearElectivoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    cupos: "",
    requisitos: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el electivo
    console.log("Crear electivo:", formData);
    alert("Electivo creado exitosamente (simulado)");
    navigate(ROLE_HOME_PATH.PROFESOR);
  };

  const handleCancel = () => {
    navigate(ROLE_HOME_PATH.PROFESOR);
  };

  return (
    <AppShell
      title="Crear Nuevo Electivo"
      description="Completa el formulario para crear un nuevo electivo."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <h2>Crear Nuevo Electivo</h2>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre del Electivo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className="form-input"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Desarrollo Web Moderno"
            />
          </div>

          <div className="form-group">
            <label htmlFor="codigo" className="form-label">
              Código del Electivo *
            </label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              className="form-input"
              value={formData.codigo}
              onChange={handleChange}
              required
              placeholder="Ej: ISW-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion" className="form-label">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="form-textarea"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe el contenido y objetivos del electivo..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="cupos" className="form-label">
              Cupos Disponibles *
            </label>
            <input
              type="number"
              id="cupos"
              name="cupos"
              className="form-input"
              value={formData.cupos}
              onChange={handleChange}
              required
              min="1"
              placeholder="Ej: 30"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requisitos" className="form-label">
              Requisitos
            </label>
            <textarea
              id="requisitos"
              name="requisitos"
              className="form-textarea"
              value={formData.requisitos}
              onChange={handleChange}
              rows="3"
              placeholder="Lista los requisitos para inscribirse en este electivo..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="button button--primary">
              Crear Electivo
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

export default CrearElectivoPage;

