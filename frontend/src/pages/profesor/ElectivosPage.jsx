import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

// Datos mock de electivos del profesor
const MOCK_ELECTIVOS = [
  {
    id: 1,
    nombre: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    descripcion: "Aprende las últimas tecnologías web: React, Node.js y bases de datos.",
    cupos: 30,
    inscritos: 25,
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    descripcion: "Introducción a machine learning y redes neuronales.",
    cupos: 25,
    inscritos: 20,
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Seguridad Informática",
    codigo: "ISW-003",
    descripcion: "Fundamentos de ciberseguridad y protección de datos.",
    cupos: 20,
    inscritos: 15,
    estado: "activo",
  },
];

function ElectivosPage() {
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos/editar/${id}`);
  };

  const handleCreate = () => {
    navigate(`${ROLE_HOME_PATH.PROFESOR}/electivos/crear`);
  };

  return (
    <AppShell
      title="Mis Electivos"
      description="Gestiona tus electivos: crea nuevos, edita existentes o configura detalles."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Mis Electivos</h2>
            <p>Gestiona la información de tus cursos electivos</p>
          </div>
          <button type="button" className="button button--primary" onClick={handleCreate}>
            + Crear nuevo electivo
          </button>
        </header>

        <div className="electivos-grid">
          {MOCK_ELECTIVOS.map((electivo) => (
            <article key={electivo.id} className="electivo-card">
              <div className="electivo-card__header">
                <div>
                  <h3>{electivo.nombre}</h3>
                  <span className="electivo-card__code">{electivo.codigo}</span>
                </div>
                <span className={`status-badge status-badge--${electivo.estado}`}>
                  {electivo.estado}
                </span>
              </div>
              <p className="electivo-card__description">{electivo.descripcion}</p>
              <div className="electivo-card__stats">
                <div className="stat-item">
                  <span className="stat-label">Cupos:</span>
                  <span className="stat-value">{electivo.cupos}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Inscritos:</span>
                  <span className="stat-value">{electivo.inscritos}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Disponibles:</span>
                  <span className="stat-value">{electivo.cupos - electivo.inscritos}</span>
                </div>
              </div>
              <div className="electivo-card__actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => handleEdit(electivo.id)}
                >
                  Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default ElectivosPage;

