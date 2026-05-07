import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      navigate("/reservas");
    } else {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-main">
        <div className="login-card">
          <span className="login-eyebrow">Bienvenido</span>
          <h1 className="login-title">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-gem">✦</span>
            <span className="login-divider-line" />
          </div>
          <p className="login-sub">
            {mode === "login"
              ? "Inicia sesión para hacer tu reserva"
              : "Regístrate para hacer tu reserva"}
          </p>

          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Iniciar sesión
            </button>
            <button
              className={`login-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario de inicio de sesión */}
          {mode === "login" && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit-btn">
                Iniciar sesión
              </button>
            </form>
          )}

          {/* Formulario de registro (solo UI por ahora) */}
          {mode === "register" && (
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
              <div className="login-field">
                <label>Nombre completo</label>
                <input type="text" placeholder="Tu nombre" />
              </div>
              <div className="login-field">
                <label>Correo electrónico</label>
                <input type="email" placeholder="tucorreo@ejemplo.com" />
              </div>
              <div className="login-field">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="login-field">
                <label>Confirmar contraseña</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button type="submit" className="login-submit-btn">
                Crear cuenta
              </button>
            </form>
          )}

          <div className="login-or">
            <span className="login-or-line" />
            <span className="login-or-text">o</span>
            <span className="login-or-line" />
          </div>

          <button className="google-btn">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="google-icon"
            />
            Continuar con Google
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Login;
