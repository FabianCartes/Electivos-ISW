import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de cupos
const MOCK_CUPOS = [
  {
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    cuposTotales: 30,
    cuposOcupados: 25,
    cuposDisponibles: 5,
    porcentajeOcupacion: 83.3,
  },
  {
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    cuposTotales: 25,
    cuposOcupados: 20,
    cuposDisponibles: 5,
    porcentajeOcupacion: 80.0,
  },
  {
    electivo: "Seguridad Informática",
    codigo: "ISW-003",
    cuposTotales: 20,
    cuposOcupados: 15,
    cuposDisponibles: 5,
    porcentajeOcupacion: 75.0,
  },
];

function CuposPage() {
  return (
    <AppShell
      title="Cupos Disponibles/Ocupados"
      description="Consulta el estado actual de los cupos en tus electivos."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Estado de Cupos</h2>
            <p>Visualiza la disponibilidad de cupos por electivo</p>
          </div>
        </header>

        <div className="cupos-list">
          {MOCK_CUPOS.map((cupo, index) => (
            <article key={index} className="cupo-card">
              <div className="cupo-card__header">
                <div>
                  <h3>{cupo.electivo}</h3>
                  <span className="cupo-card__code">{cupo.codigo}</span>
                </div>
                <span
                  className={`status-badge ${
                    cupo.porcentajeOcupacion >= 90
                      ? "status-badge--warning"
                      : cupo.porcentajeOcupacion >= 100
                      ? "status-badge--danger"
                      : "status-badge--success"
                  }`}
                >
                  {cupo.porcentajeOcupacion >= 100 ? "Completo" : "Disponible"}
                </span>
              </div>

              <div className="cupo-card__content">
                <div className="cupo-stats">
                  <div className="cupo-stat">
                    <span className="cupo-stat__label">Cupos Totales:</span>
                    <span className="cupo-stat__value">{cupo.cuposTotales}</span>
                  </div>
                  <div className="cupo-stat">
                    <span className="cupo-stat__label">Ocupados:</span>
                    <span className="cupo-stat__value cupo-stat__value--occupied">
                      {cupo.cuposOcupados}
                    </span>
                  </div>
                  <div className="cupo-stat">
                    <span className="cupo-stat__label">Disponibles:</span>
                    <span className="cupo-stat__value cupo-stat__value--available">
                      {cupo.cuposDisponibles}
                    </span>
                  </div>
                </div>

                <div className="cupo-card__progress">
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill progress-bar__fill--ocupados"
                      style={{ width: `${cupo.porcentajeOcupacion}%` }}
                    />
                  </div>
                  <div className="progress-bar__labels">
                    <span>{cupo.porcentajeOcupacion.toFixed(1)}% ocupado</span>
                    <span>{cupo.cuposDisponibles} cupos disponibles</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default CuposPage;

