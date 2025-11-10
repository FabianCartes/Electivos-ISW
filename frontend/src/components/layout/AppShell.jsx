import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_HOME_PATH } from "../../constants/roles.js";

function AppShell({ title, description, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigateHome = () => {
    const homePath = ROLE_HOME_PATH[user?.role] ?? "/";
    navigate(homePath);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand" role="presentation" onClick={handleNavigateHome}>
          <span className="app-shell__logo">
            <span>Electivos</span>
            <span>ISW</span>
          </span>
          <div className="app-shell__meta">
            <strong>{title}</strong>
            {description ? <small>{description}</small> : null}
          </div>
        </div>

        <div className="app-shell__user">
          <div>
            <span className="app-shell__user-name">{user?.nombre ?? "Usuario"}</span>
            <small className="app-shell__user-role">{user?.role ?? ""}</small>
          </div>
          <button type="button" className="button button--secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-shell__content">{children}</main>
    </div>
  );
}

AppShell.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

AppShell.defaultProps = {
  description: "",
};

export default AppShell;


