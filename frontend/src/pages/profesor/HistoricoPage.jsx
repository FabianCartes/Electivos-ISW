import AppShell from "../../components/layout/AppShell.jsx";

// Datos mock de histórico
const MOCK_HISTORICO = [
  {
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    periodo: "2023-2",
    totalAlumnos: 28,
    aprobados: 25,
    reprobados: 3,
    promedioNota: 5.8,
  },
  {
    electivo: "Desarrollo Web Moderno",
    codigo: "ISW-001",
    periodo: "2023-1",
    totalAlumnos: 30,
    aprobados: 27,
    reprobados: 3,
    promedioNota: 6.0,
  },
  {
    electivo: "Inteligencia Artificial Aplicada",
    codigo: "ISW-002",
    periodo: "2023-2",
    totalAlumnos: 22,
    aprobados: 20,
    reprobados: 2,
    promedioNota: 5.9,
  },
  {
    electivo: "Seguridad Informática",
    codigo: "ISW-003",
    periodo: "2023-2",
    totalAlumnos: 18,
    aprobados: 16,
    reprobados: 2,
    promedioNota: 6.1,
  },
];

function HistoricoPage() {
  // Agrupar por electivo
  const historicoPorElectivo = MOCK_HISTORICO.reduce((acc, item) => {
    if (!acc[item.electivo]) {
      acc[item.electivo] = [];
    }
    acc[item.electivo].push(item);
    return acc;
  }, {});

  return (
    <AppShell
      title="Histórico de Alumnos"
      description="Revisa el historial de estudiantes que han cursado tus electivos en períodos anteriores."
    >
      <section className="panel-card">
        <header className="panel-card__header">
          <div>
            <h2>Histórico por Electivo</h2>
            <p>Registro de alumnos en períodos anteriores</p>
          </div>
        </header>

        <div className="historico-list">
          {Object.entries(historicoPorElectivo).map(([electivo, registros]) => (
            <article key={electivo} className="historico-card">
              <div className="historico-card__header">
                <div>
                  <h3>{electivo}</h3>
                  <span className="historico-card__code">{registros[0].codigo}</span>
                </div>
                <span className="historico-card__total-periodos">
                  {registros.length} período(s)
                </span>
              </div>

              <div className="historico-card__content">
                <table className="historico-table">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Total Alumnos</th>
                      <th>Aprobados</th>
                      <th>Reprobados</th>
                      <th>Promedio Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((registro, index) => (
                      <tr key={index}>
                        <td>{registro.periodo}</td>
                        <td>{registro.totalAlumnos}</td>
                        <td className="text-success">{registro.aprobados}</td>
                        <td className="text-danger">{registro.reprobados}</td>
                        <td>{registro.promedioNota.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default HistoricoPage;

