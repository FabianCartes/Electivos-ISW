import { useState, useEffect } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import apiClient from "../../services/apiClient.js";

function MisInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        const response = await apiClient.get("/inscripciones/mis-inscripciones");
        setInscripciones(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar inscripciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

  return (
    <AppShell title="Mis Electivos Inscritos" description="Historial de tus postulaciones">
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Electivos Actuales</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : inscripciones.length === 0 ? (
          <p className="text-gray-500">No has inscrito ningún electivo todavía.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {inscripciones.map((item) => (
              <article key={item.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-blue-700">{item.electivo.titulo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                    ${item.status === 'APROBADA' ? 'bg-green-100 text-green-700' : 
                      item.status === 'RECHAZADA' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{item.electivo.descripcion}</p>
                <p className="text-sm font-medium text-gray-500">
                  Profesor: {item.electivo.profesor ? item.electivo.profesor.nombre : "Sin asignar"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default MisInscripcionesPage;