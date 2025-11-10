import { useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de inscripciones
const MOCK_INSCRIPCIONES = [
  {
    id: 1,
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    alumnos: [
      { id: 1, nombre: "Juan Pérez", email: "juan.perez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 2, nombre: "María González", email: "maria.gonzalez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 3, nombre: "Carlos Rodríguez", email: "carlos.rodriguez@alumnos.ubiobio.cl", estado: "pendiente" },
    ],
  },
  {
    id: 2,
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    alumnos: [
      { id: 4, nombre: "Ana Martínez", email: "ana.martinez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 5, nombre: "Luis Sánchez", email: "luis.sanchez@alumnos.ubiobio.cl", estado: "aprobado" },
    ],
  },
];

function InscripcionesPage() {
  const [filter, setFilter] = useState("todos");

  const filteredInscripciones = MOCK_INSCRIPCIONES.map((inscripcion) => ({
    ...inscripcion,
    alumnos:
      filter === "todos"
        ? inscripcion.alumnos
        : inscripcion.alumnos.filter((alumno) => alumno.estado === filter),
  }));

  const handleEstadoChange = (alumnoId, nuevoEstado) => {
    // Aquí iría la lógica para cambiar el estado
    console.log(`Cambiar estado de alumno ${alumnoId} a ${nuevoEstado}`);
    alert(`Estado cambiado a ${nuevoEstado} (simulado)`);
  };

  return (
    <AppShell
      title="Inscripciones"
      description="Gestiona las inscripciones de alumnos en tus electivos."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Inscripciones por Electivo</h2>
            <p>Consulta y gestiona las inscripciones de estudiantes</p>
          </div>
          <div className="filter-buttons">
            <button
              type="button"
              className={`filter-button ${filter === "todos" ? "filter-button--active" : ""}`}
              onClick={() => setFilter("todos")}
            >
              Todos
            </button>
            <button
              type="button"
              className={`filter-button ${filter === "pendiente" ? "filter-button--active" : ""}`}
              onClick={() => setFilter("pendiente")}
            >
              Pendientes
            </button>
            <button
              type="button"
              className={`filter-button ${filter === "aprobado" ? "filter-button--active" : ""}`}
              onClick={() => setFilter("aprobado")}
            >
              Aprobados
            </button>
          </div>
        </header>

        <div className="inscripciones-list">
          {filteredInscripciones.map((inscripcion) => (
            <article key={inscripcion.id} className="inscripcion-card">
              <div className="inscripcion-card__header">
                <div>
                  <h3>{inscripcion.electivo}</h3>
                  <span className="inscripcion-card__code">{inscripcion.codigo}</span>
                </div>
                <span className="inscripcion-card__count">
                  {inscripcion.alumnos.length} alumno(s)
                </span>
              </div>

              {inscripcion.alumnos.length > 0 ? (
                <div className="alumnos-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscripcion.alumnos.map((alumno) => (
                        <tr key={alumno.id}>
                          <td>{alumno.nombre}</td>
                          <td>{alumno.email}</td>
                          <td>
                            <span className={`status-badge status-badge--${alumno.estado}`}>
                              {alumno.estado}
                            </span>
                          </td>
                          <td>
                            {alumno.estado === "pendiente" && (
                              <div className="action-buttons">
                                <button
                                  type="button"
                                  className="button button--small button--success"
                                  onClick={() => handleEstadoChange(alumno.id, "aprobado")}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  className="button button--small button--danger"
                                  onClick={() => handleEstadoChange(alumno.id, "rechazado")}
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                            {alumno.estado === "aprobado" && (
                              <button
                                type="button"
                                className="button button--small button--ghost"
                                onClick={() => console.log("Ver perfil", alumno.id)}
                              >
                                Ver perfil
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-state">No hay alumnos inscritos en este electivo.</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default InscripcionesPage;

