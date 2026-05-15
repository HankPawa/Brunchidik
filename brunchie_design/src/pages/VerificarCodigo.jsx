import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./VerificarCodigo.css";

const VerificarCodigo = () => {
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [reenvio, setReenvio] = useState("");
  const { verifyCode, reenviarCodigo, pendingUser } = useAuth();
  const navigate = useNavigate();

  if (!pendingUser) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await verifyCode(code);
    setLoading(false);
    if (ok) {
      navigate("/");
    } else {
      setError("Código incorrecto o expirado. Inténtalo de nuevo.");
    }
  };

  const handleReenviar = async () => {
    setReenvio("Enviando...");
    await reenviarCodigo();
    setReenvio("¡Código reenviado!");
    setTimeout(() => setReenvio(""), 3000);
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
            <button type="submit" className="verify-btn" disabled={loading}>
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>

          <button className="verify-resend" onClick={handleReenviar}>
            {reenvio || "¿No recibiste el código? Reenviar"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerificarCodigo;
