import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_HOME_PATH, ROLES } from "../../constants/roles.js";

function RoleSwitcher() {
  const { isMocked, setMockRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const previousRoleRef = useRef(user?.role);

  // Exponer la función en window para acceso desde consola
  useEffect(() => {
    if (isMocked && setMockRole) {
      window.setMockRole = (role) => {
        if (!["ALUMNO", "PROFESOR", "JEFE_CARRERA"].includes(role)) {
          console.error(`❌ Rol inválido: ${role}. Usa: 'ALUMNO', 'PROFESOR' o 'JEFE_CARRERA'`);
          return;
        }
        setMockRole(role);
        console.log(`✅ Rol cambiado a: ${role}. Redirigiendo al dashboard...`);
        // Usar window.location para navegar (recarga la página pero funciona desde consola)
        const homePath = ROLE_HOME_PATH[role] || "/";
        window.location.href = homePath;
      };
      console.log(
        "🎭 Modo Mock activado. Usa window.setMockRole('ALUMNO'|'PROFESOR'|'JEFE_CARRERA') en la consola para cambiar de rol"
      );
    }
    return () => {
      if (window.setMockRole) {
        delete window.setMockRole;
      }
    };
  }, [isMocked, setMockRole]);

  // Auto-redirigir cuando cambie el rol del usuario
  useEffect(() => {
    if (isMocked && user?.role && previousRoleRef.current !== user?.role) {
      const homePath = ROLE_HOME_PATH[user.role];
      // Solo redirigir si no estamos ya en el dashboard correcto
      if (homePath && !location.pathname.startsWith(homePath)) {
        navigate(homePath, { replace: true });
      }
      previousRoleRef.current = user.role;
    }
  }, [user?.role, isMocked, navigate, location.pathname]);

  if (!isMocked || !setMockRole) {
    return null;
  }

  const handleRoleChange = (role) => {
    setMockRole(role);
    setIsOpen(false);
    // Redirigir al dashboard correspondiente después de un pequeño delay
    setTimeout(() => {
      const homePath = ROLE_HOME_PATH[role] || "/";
      navigate(homePath, { replace: true });
    }, 100);
  };

  const roles = [
    { key: ROLES.ALUMNO, label: "Alumno" },
    { key: ROLES.PROFESOR, label: "Profesor" },
    { key: ROLES.JEFE_CARRERA, label: "Jefe de Carrera" },
  ];

  return (
    <div className="role-switcher">
      <button
        type="button"
        className="role-switcher__toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Cambiar rol (solo en modo mock)"
      >
        🎭 {user?.role || "Sin rol"}
      </button>
      {isOpen && (
        <div className="role-switcher__menu">
          <div className="role-switcher__header">Cambiar Rol (Mock)</div>
          {roles.map((role) => (
            <button
              key={role.key}
              type="button"
              className={`role-switcher__option ${
                user?.role === role.key ? "role-switcher__option--active" : ""
              }`}
              onClick={() => handleRoleChange(role.key)}
            >
              {role.label}
            </button>
          ))}
          <div className="role-switcher__hint">
            También puedes usar: <code>window.setMockRole('ALUMNO')</code> en la consola
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;

