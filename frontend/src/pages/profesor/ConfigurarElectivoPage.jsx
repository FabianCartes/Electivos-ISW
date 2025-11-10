import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

function ConfigurarElectivoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cupos: "30",
    descripcion: "Descripción detallada del electivo...",
    requisitos: "Requisitos para inscribirse...",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Configurar electivo:", id, formData);
    alert("Electivo configurado exitosamente (simulado)");
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos`);
  };

  const handleCancel = () => {
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos`);
  };

  return (
    <AppShell
      title="Configurar Electivo"
      description="Define cupos, descripción y requisitos del electivo."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <h2>Configurar Electivo #{id}</h2>
        </header>

        <form onSubmit={handleSubmit} className="form">
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
            <label htmlFor="descripcion" className="form-label">
              Descripción Detallada *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="form-textarea"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe en detalle el contenido, objetivos y metodología del electivo..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="requisitos" className="form-label">
              Requisitos *
            </label>
            <textarea
              id="requisitos"
              name="requisitos"
              className="form-textarea"
              value={formData.requisitos}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Lista los requisitos académicos, conocimientos previos, etc..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="button button--primary">
              Guardar Configuración
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

export default ConfigurarElectivoPage;

