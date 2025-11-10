import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de estadísticas
const MOCK_ESTADISTICAS = [
  {
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    totalInscritos: 25,
    cupos: 30,
    tasaInscripcion: 83.3,
    aprobados: 20,
    pendientes: 5,
  },
  {
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    totalInscritos: 20,
    cupos: 25,
    tasaInscripcion: 80.0,
    aprobados: 18,
    pendientes: 2,
  },
  {
    electivo: "Seguridad Informática",
    codigo: "ISW-003",
    totalInscritos: 15,
    cupos: 20,
    tasaInscripcion: 75.0,
    aprobados: 12,
    pendientes: 3,
  },
];

function EstadisticasPage() {
  return (
    <AppShell
      title="Estadísticas de Inscripción"
      description="Visualiza datos estadísticos sobre las inscripciones en tus electivos."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Estadísticas por Electivo</h2>
            <p>Datos sobre inscripciones y participación</p>
          </div>
        </header>

        <div className="estadisticas-grid">
          {MOCK_ESTADISTICAS.map((stat, index) => (
            <article key={index} className="estadistica-card">
              <div className="estadistica-card__header">
                <h3>{stat.electivo}</h3>
                <span className="estadistica-card__code">{stat.codigo}</span>
              </div>

              <div className="estadistica-card__content">
                <div className="stat-item">
                  <span className="stat-label">Total Inscritos:</span>
                  <span className="stat-value">{stat.totalInscritos}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cupos Disponibles:</span>
                  <span className="stat-value">{stat.cupos}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tasa de Inscripción:</span>
                  <span className="stat-value">{stat.tasaInscripcion}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Aprobados:</span>
                  <span className="stat-value stat-value--success">{stat.aprobados}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pendientes:</span>
                  <span className="stat-value stat-value--warning">{stat.pendientes}</span>
                </div>
              </div>

              <div className="estadistica-card__chart">
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${stat.tasaInscripcion}%` }}
                  />
                </div>
                <span className="progress-bar__label">
                  {stat.totalInscritos} / {stat.cupos} cupos
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default EstadisticasPage;

