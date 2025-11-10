import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

// Datos mock - en producción esto vendría de una API
const MOCK_ELECTIVOS = [
  {
    id: 1,
    nombre: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    descripcion: "Aprende las últimas tecnologías web: React, Node.js y bases de datos.",
    cupos: 30,
    requisitos: "Haber aprobado Programación II",
  },
  {
    id: 2,
    nombre: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    descripcion: "Introducción a machine learning y redes neuronales.",
    cupos: 25,
    requisitos: "Haber aprobado Matemáticas Discretas",
  },
  {
    id: 3,
    nombre: "Seguridad Informática",
    codigo: "ISW-003",
    descripcion: "Fundamentos de ciberseguridad y protección de datos.",
    cupos: 20,
    requisitos: "Haber aprobado Redes de Computadores",
  },
];

function EditarElectivoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Buscar el electivo por ID (en producción esto vendría de una API)
  const electivoExistente = MOCK_ELECTIVOS.find((e) => e.id === parseInt(id));
  
  const [formData, setFormData] = useState({
    nombre: electivoExistente?.nombre || "",
    codigo: electivoExistente?.codigo || "",
    descripcion: electivoExistente?.descripcion || "",
    cupos: electivoExistente?.cupos?.toString() || "",
    requisitos: electivoExistente?.requisitos || "",
  });

  useEffect(() => {
    if (electivoExistente) {
      setFormData({
        nombre: electivoExistente.nombre,
        codigo: electivoExistente.codigo,
        descripcion: electivoExistente.descripcion,
        cupos: electivoExistente.cupos.toString(),
        requisitos: electivoExistente.requisitos || "",
      });
    }
  }, [electivoExistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Editar electivo:", id, formData);
    alert("Electivo actualizado exitosamente (simulado)");
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos`);
  };

  const handleCancel = () => {
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos`);
  };

  if (!electivoExistente) {
    return (
      <AppShell title="Editar Electivo" description="Electivo no encontrado.">
        <section className="panel-card">
          <p>El electivo solicitado no existe.</p>
          <button type="button" className="button button--primary" onClick={handleCancel}>
            Volver a mis electivos
          </button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Editar Electivo"
      description="Modifica la información del electivo."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <h2>Editar Electivo: {electivoExistente.nombre}</h2>
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
              rows="6"
              placeholder="Describe en detalle el contenido, objetivos y metodología del electivo..."
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
              rows="4"
              placeholder="Lista los requisitos académicos, conocimientos previos, etc..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="button button--primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

export default EditarElectivoPage;

