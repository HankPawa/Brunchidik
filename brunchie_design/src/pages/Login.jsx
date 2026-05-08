import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [mode, setMode] = useState("login");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [regNombre, setRegNombre]   = useState("");
  const [regEmail, setRegEmail]     = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regMsg, setRegMsg]         = useState({ text: "", ok: false });
  const [regLoading, setRegLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const result = await login(email, password);
    setLoginLoading(false);
    if (result === "2fa")     navigate("/verificar-codigo");
    else if (result === "success") navigate("/");
    else if (result === "invalid") setLoginError("Correo o contraseña incorrectos.");
    else setLoginError("No se pudo conectar al servidor.");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setRegMsg({ text: "Las contraseñas no coinciden.", ok: false });
      return;
    }
    setRegLoading(true);
    setRegMsg({ text: "", ok: false });
    const result = await register(regNombre, regEmail, regPassword);
    setRegLoading(false);
    if (result.ok) {
      setRegMsg({ text: "¡Cuenta creada! Ya puedes iniciar sesión.", ok: true });
      setRegNombre(""); setRegEmail(""); setRegPassword(""); setRegConfirm("");
      setTimeout(() => setMode("login"), 1500);
    } else {
      setRegMsg({ text: result.error, ok: false });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await infoRes.json();
        const result = await loginWithGoogle(googleUser);
        if (result === "2fa")     navigate("/verificar-codigo");
        else if (result === "success") navigate("/");
        else setLoginError("Error al iniciar sesión con Google.");
      } catch {
        setLoginError("Error al iniciar sesión con Google.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setLoginError("Error al iniciar sesión con Google."),
  });

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
            {mode === "login" ? "Inicia sesión para hacer tu reserva" : "Regístrate para hacer tu reserva"}
          </p>

          <div className="login-tabs">
            <button className={`login-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setLoginError(""); }}>
              Iniciar sesión
            </button>
            <button className={`login-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setRegMsg({ text: "", ok: false }); }}>
              Registrarse
            </button>
          </div>

          {mode === "login" && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label>Correo electrónico</label>
                <input type="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="login-field">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {loginError && <p className="login-error">{loginError}</p>}
              <button type="submit" className="login-submit-btn" disabled={loginLoading}>
                {loginLoading ? "Verificando..." : "Iniciar sesión"}
              </button>
              <Link to="/forgot-password" className="login-forgot">¿Olvidaste tu contraseña?</Link>
            </form>
          )}

          {mode === "register" && (
            <form className="login-form" onSubmit={handleRegister}>
              <div className="login-field">
                <label>Nombre completo</label>
                <input type="text" placeholder="Tu nombre" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required />
              </div>
              <div className="login-field">
                <label>Correo electrónico</label>
                <input type="email" placeholder="tucorreo@ejemplo.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>
              <div className="login-field">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
              <div className="login-field">
                <label>Confirmar contraseña</label>
                <input type="password" placeholder="••••••••" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required />
              </div>
              {regMsg.text && (
                <p className={`login-error ${regMsg.ok ? "login-success" : ""}`}>{regMsg.text}</p>
              )}
              <button type="submit" className="login-submit-btn" disabled={regLoading}>
                {regLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}

          <div className="login-or">
            <span className="login-or-line" />
            <span className="login-or-text">o</span>
            <span className="login-or-line" />
          </div>

          <button className="google-btn" onClick={() => googleLogin()} disabled={googleLoading}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            {googleLoading ? "Conectando..." : "Continuar con Google"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;
