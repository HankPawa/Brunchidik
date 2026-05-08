import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./VerificarCodigo.css";

const VerificarCodigo = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { verifyCode, pendingUser } = useAuth();
  const navigate = useNavigate();

  if (!pendingUser) {
    navigate("/login");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = verifyCode(code);
    if (ok) {
      navigate("/");
    } else {
      setError("Código incorrecto. Inténtalo de nuevo.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="verify-main">
        <div className="verify-card">
          <div className="verify-icon">✉️</div>
          <span className="verify-eyebrow">Verificación</span>
          <h1 className="verify-title">Código de seguridad</h1>
          <div className="verify-divider">
            <span className="verify-divider-line" />
            <span className="verify-divider-gem">✦</span>
            <span className="verify-divider-line" />
          </div>
          <p className="verify-sub">
            Hemos enviado un código de 6 dígitos a <strong>{pendingUser.email}</strong>.
            Ingrésalo a continuación para continuar.
          </p>

          <div className="verify-demo-note">
            Demo: usa el código <strong>123456</strong>
          </div>

          <form className="verify-form" onSubmit={handleSubmit}>
            <input
              className="verify-input"
              type="text"
              maxLength={6}
              placeholder="------"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              required
            />
            {error && <p className="verify-error">{error}</p>}
            <button type="submit" className="verify-btn">Verificar</button>
          </form>

          <button className="verify-resend" onClick={() => {}}>
            ¿No recibiste el código? Reenviar
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerificarCodigo;
