import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ROLE_HOME_PATH, ROLES } from "./constants/roles.js";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AlumnoDashboard from "./pages/dashboard/AlumnoDashboard.jsx";
import ProfesorDashboard from "./pages/dashboard/ProfesorDashboard.jsx";
import JefeCarreraDashboard from "./pages/dashboard/JefeCarreraDashboard.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import InscribirElectivosPage from "./pages/alumno/InscribirElectivosPage.jsx";
import ElectivosPage from "./pages/profesor/ElectivosPage.jsx";
import CrearElectivoPage from "./pages/profesor/CrearElectivoPage.jsx";
import EditarElectivoPage from "./pages/profesor/EditarElectivoPage.jsx";
import InscripcionesPage from "./pages/profesor/InscripcionesPage.jsx";
import SolicitudesPage from "./pages/profesor/SolicitudesPage.jsx";
import PerfilesPage from "./pages/profesor/PerfilesPage.jsx";
import EstadisticasPage from "./pages/profesor/EstadisticasPage.jsx";
import CuposPage from "./pages/profesor/CuposPage.jsx";
import HistoricoPage from "./pages/profesor/HistoricoPage.jsx";
import RoleSwitcher from "./components/dev/RoleSwitcher.jsx";

function App() {
  const { user } = useAuth();
  const defaultRedirect = user?.role ? ROLE_HOME_PATH[user.role] : "/login";

  return (
    <>
      <RoleSwitcher />
      <Routes>
      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ALUMNO]} />}>
        <Route path={ROLE_HOME_PATH[ROLES.ALUMNO]} element={<AlumnoDashboard />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.ALUMNO]}/inscribir`} element={<InscribirElectivosPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.PROFESOR]} />}>
        <Route path={ROLE_HOME_PATH[ROLES.PROFESOR]} element={<ProfesorDashboard />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/electivos`} element={<ElectivosPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/electivos/crear`} element={<CrearElectivoPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/electivos/editar/:id`} element={<EditarElectivoPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/inscripciones`} element={<InscripcionesPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/inscripciones/solicitudes`} element={<SolicitudesPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/inscripciones/perfiles`} element={<PerfilesPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/reportes/estadisticas`} element={<EstadisticasPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/reportes/cupos`} element={<CuposPage />} />
        <Route path={`${ROLE_HOME_PATH[ROLES.PROFESOR]}/reportes/historico`} element={<HistoricoPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.JEFE_CARRERA]} />}>
        <Route path={ROLE_HOME_PATH[ROLES.JEFE_CARRERA]} element={<JefeCarreraDashboard />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
