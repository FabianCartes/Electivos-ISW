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
      { id: 6, nombre: "Pedro López", email: "pedro.lopez@alumnos.ubiobio.cl", estado: "rechazado" },
    ],
  },
  {
    id: 2,
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    alumnos: [
      { id: 4, nombre: "Ana Martínez", email: "ana.martinez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 5, nombre: "Luis Sánchez", email: "luis.sanchez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 7, nombre: "Laura Torres", email: "laura.torres@alumnos.ubiobio.cl", estado: "pendiente" },
    ],
  },
  {
    id: 3,
    electivo: "Seguridad Informática",
    codigo: "ISW-003",
    alumnos: [
      { id: 8, nombre: "Diego Ramírez", email: "diego.ramirez@alumnos.ubiobio.cl", estado: "aprobado" },
      { id: 9, nombre: "Sofía Morales", email: "sofia.morales@alumnos.ubiobio.cl", estado: "pendiente" },
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

  // Contar alumnos por estado
  const getEstadisticas = (alumnos) => {
    return {
      total: alumnos.length,
      aprobados: alumnos.filter((a) => a.estado === "aprobado").length,
      pendientes: alumnos.filter((a) => a.estado === "pendiente").length,
      rechazados: alumnos.filter((a) => a.estado === "rechazado").length,
    };
  };

  return (
    <AppShell
      title="Inscripciones"
      description="Consulta las inscripciones de alumnos en tus electivos."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Inscripciones por Electivo</h2>
            <p>Consulta los alumnos inscritos en cada uno de tus electivos y sus estados</p>
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
            <button
              type="button"
              className={`filter-button ${filter === "rechazado" ? "filter-button--active" : ""}`}
              onClick={() => setFilter("rechazado")}
            >
              Rechazados
            </button>
          </div>
        </header>

        <div className="inscripciones-list">
          {filteredInscripciones.map((inscripcion) => {
            const stats = getEstadisticas(inscripcion.alumnos);
            return (
              <article key={inscripcion.id} className="inscripcion-card">
                <div className="inscripcion-card__header">
                  <div>
                    <h3>{inscripcion.electivo}</h3>
                    <span className="inscripcion-card__code">{inscripcion.codigo}</span>
                  </div>
                  <div className="inscripcion-card__stats-header">
                    <span className="inscripcion-card__count">
                      {stats.total} alumno(s) total
                    </span>
                    <div className="inscripcion-card__mini-stats">
                      <span className="stat-mini stat-mini--aprobado">{stats.aprobados} aprobados</span>
                      <span className="stat-mini stat-mini--pendiente">{stats.pendientes} pendientes</span>
                      <span className="stat-mini stat-mini--rechazado">{stats.rechazados} rechazados</span>
                    </div>
                  </div>
                </div>

                {inscripcion.alumnos.length > 0 ? (
                  <div className="alumnos-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Estado</th>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-state">No hay alumnos inscritos en este electivo con el filtro seleccionado.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

export default InscripcionesPage;

