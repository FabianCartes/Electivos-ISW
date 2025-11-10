import { Link } from "react-router-dom";
import { ROLE_HOME_PATH } from "../constants/roles.js";
import { useAuth } from "../context/AuthContext.jsx";

function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();
  const fallbackPath = user?.role ? ROLE_HOME_PATH[user.role] : "/login";

  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>No encontramos la página que buscas.</p>
      <Link to={fallbackPath} className="button button--primary">
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFoundPage;


