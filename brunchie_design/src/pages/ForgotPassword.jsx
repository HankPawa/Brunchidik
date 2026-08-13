import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => { document.title = "Recuperar contrasena | Brunch & Co."; }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main className="forgot-main">
        <div className="forgot-card">
          {!sent ? (
            <>
              <span className="forgot-eyebrow">Recuperar acceso</span>
              <h1 className="forgot-title">¿Olvidaste tu contraseña?</h1>
              <div className="forgot-divider">
                <span className="forgot-divider-line" />
                <span className="forgot-divider-gem">✦</span>
                <span className="forgot-divider-line" />
              </div>
              <p className="forgot-sub">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>
              <form className="forgot-form" onSubmit={handleSubmit}>
                <div className="forgot-field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@#\-\.]/g, ""))}
                    required
                  />
                </div>
                <button type="submit" className="forgot-btn">Enviar enlace</button>
              </form>
              <Link to="/login" className="forgot-back">← Volver al inicio de sesión</Link>
            </>
          ) : (
            <>
              <div className="forgot-success-icon">✉️</div>
              <span className="forgot-eyebrow">Correo enviado</span>
              <h1 className="forgot-title">Revisa tu bandeja</h1>
              <div className="forgot-divider">
                <span className="forgot-divider-line" />
                <span className="forgot-divider-gem">✦</span>
                <span className="forgot-divider-line" />
              </div>
              <p className="forgot-sub">
                Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>.
                Revisa también tu carpeta de spam.
              </p>
              <Link to="/login" className="forgot-btn" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword;
