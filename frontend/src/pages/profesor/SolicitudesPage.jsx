import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de solicitudes pendientes
const MOCK_SOLICITUDES = [
  {
    id: 1,
    alumno: {
      id: 1,
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@alumnos.ubiobio.cl",
    },
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    fechaSolicitud: "2024-01-15",
  },
  {
    id: 2,
    alumno: {
      id: 2,
      nombre: "Patricia López",
      email: "patricia.lopez@alumnos.ubiobio.cl",
    },
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    fechaSolicitud: "2024-01-16",
  },
  {
    id: 3,
    alumno: {
      id: 3,
      nombre: "Roberto Silva",
      email: "roberto.silva@alumnos.ubiobio.cl",
    },
    electivo: "Seguridad Informática",
    codigo: "ISW-003",
    fechaSolicitud: "2024-01-17",
  },
];

function SolicitudesPage() {
  const handleAprobar = (solicitudId) => {
    console.log("Aprobar solicitud:", solicitudId);
    alert("Solicitud aprobada (simulado)");
  };

  const handleRechazar = (solicitudId) => {
    console.log("Rechazar solicitud:", solicitudId);
    alert("Solicitud rechazada (simulado)");
  };

  const handleVerPerfil = (alumnoId) => {
    console.log("Ver perfil de alumno:", alumnoId);
    // Aquí se navegaría a la página de perfil
  };

  return (
    <AppShell
      title="Solicitudes de Inscripción"
      description="Revisa y gestiona las solicitudes de inscripción pendientes."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Solicitudes Pendientes</h2>
            <p>Gestiona las solicitudes de inscripción de los estudiantes</p>
          </div>
          <span className="badge badge--warning">{MOCK_SOLICITUDES.length} pendientes</span>
        </header>

        <div className="solicitudes-list">
          {MOCK_SOLICITUDES.map((solicitud) => (
            <article key={solicitud.id} className="solicitud-card">
              <div className="solicitud-card__header">
                <div>
                  <h3>{solicitud.electivo}</h3>
                  <span className="solicitud-card__code">{solicitud.codigo}</span>
                </div>
                <span className="solicitud-card__date">
                  Solicitud: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                </span>
              </div>

              <div className="solicitud-card__content">
                <div className="solicitud-card__alumno">
                  <div>
                    <strong>Alumno:</strong> {solicitud.alumno.nombre}
                  </div>
                  <div>
                    <strong>Email:</strong> {solicitud.alumno.email}
                  </div>
                </div>

                <div className="solicitud-card__actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => handleVerPerfil(solicitud.alumno.id)}
                  >
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    className="button button--success"
                    onClick={() => handleAprobar(solicitud.id)}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => handleRechazar(solicitud.id)}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {MOCK_SOLICITUDES.length === 0 && (
          <div className="empty-state">
            <p>No hay solicitudes pendientes en este momento.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default SolicitudesPage;

