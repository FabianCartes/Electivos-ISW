import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de perfiles de alumnos
const MOCK_PERFILES = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@alumnos.ubiobio.cl",
    carrera: "Ingeniería en Sistemas",
    año: "4to año",
    electivos: ["Desarrollo Web Moderno", "Inteligencia Artificial Aplicada"],
    promedio: 6.2,
  },
  {
    id: 2,
    nombre: "María González",
    email: "maria.gonzalez@alumnos.ubiobio.cl",
    carrera: "Ingeniería en Sistemas",
    año: "3er año",
    electivos: ["Desarrollo Web Moderno"],
    promedio: 6.5,
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    email: "ana.martinez@alumnos.ubiobio.cl",
    carrera: "Ingeniería en Sistemas",
    año: "5to año",
    electivos: ["Inteligencia Artificial Aplicada", "Seguridad Informática"],
    promedio: 6.8,
  },
];

function PerfilesPage() {
  return (
    <AppShell
      title="Perfiles de Alumnos"
      description="Consulta los perfiles detallados de los estudiantes inscritos."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Perfiles de Alumnos Inscritos</h2>
            <p>Información detallada de los estudiantes en tus electivos</p>
          </div>
        </header>

        <div className="perfiles-grid">
          {MOCK_PERFILES.map((perfil) => (
            <article key={perfil.id} className="perfil-card">
              <div className="perfil-card__header">
                <div className="perfil-card__avatar">
                  <span>{perfil.nombre.charAt(0)}</span>
                </div>
                <div>
                  <h3>{perfil.nombre}</h3>
                  <span className="perfil-card__email">{perfil.email}</span>
                </div>
              </div>

              <div className="perfil-card__content">
                <div className="perfil-card__info">
                  <div className="info-item">
                    <strong>Carrera:</strong> {perfil.carrera}
                  </div>
                  <div className="info-item">
                    <strong>Año:</strong> {perfil.año}
                  </div>
                  <div className="info-item">
                    <strong>Promedio:</strong> {perfil.promedio}
                  </div>
                </div>

                <div className="perfil-card__electivos">
                  <strong>Electivos inscritos:</strong>
                  <ul>
                    {perfil.electivos.map((electivo, index) => (
                      <li key={index}>{electivo}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="perfil-card__actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => console.log("Ver perfil completo", perfil.id)}
                >
                  Ver perfil completo
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => console.log("Contactar", perfil.id)}
                >
                  Contactar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default PerfilesPage;

