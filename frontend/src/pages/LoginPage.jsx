import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_HOME_PATH } from "../constants/roles.js";

const INITIAL_FORM = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState("");

  if (isAuthenticated && user?.role) {
    const redirectPath = ROLE_HOME_PATH[user.role] ?? "/";
    return <Navigate to={redirectPath} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.email.trim() || !formValues.password.trim()) {
      setFormError("Debes ingresar el correo y la contraseña.");
      return;
    }

    try {
      const authenticatedUser = await login({
        email: formValues.email.trim(),
        password: formValues.password,
      });
      const redirectPath = ROLE_HOME_PATH[authenticatedUser.role] ?? "/";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <h1>Portal Electivos ISW</h1>
          <p>Inicia sesión para gestionar los electivos según tu rol.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__field">
            <span>Correo institucional</span>
            <input
              type="email"
              name="email"
              placeholder="nombre.apellido@alumnos.ubiobio.cl"
              value={formValues.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-form__field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={formValues.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {(formError || error) && (
            <p className="auth-form__error">{formError || error}</p>
          )}

          <button type="submit" className="button button--primary" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <footer className="auth-card__footer">
          <small>¿No tienes cuenta? Solicita tu acceso al administrador.</small>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;


