import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 2500);
  };

  return (
    <>
      <Navbar />
      <main className="reset-main">
        <div className="reset-card">
          {!done ? (
            <>
              <span className="reset-eyebrow">Nueva contraseña</span>
              <h1 className="reset-title">Restablece tu contraseña</h1>
              <div className="reset-divider">
                <span className="reset-divider-line" />
                <span className="reset-divider-gem">✦</span>
                <span className="reset-divider-line" />
              </div>
              <form className="reset-form" onSubmit={handleSubmit}>
                <div className="reset-field">
                  <label>Nueva contraseña</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} required />
                </div>
                <div className="reset-field">
                  <label>Confirmar contraseña</label>
                  <input type="password" placeholder="••••••••" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} required />
                </div>
                {error && <p className="reset-error">{error}</p>}
                <button type="submit" className="reset-btn">Guardar contraseña</button>
              </form>
            </>
          ) : (
            <>
              <div className="reset-success-icon">✓</div>
              <h1 className="reset-title">¡Contraseña actualizada!</h1>
              <p className="reset-sub">Serás redirigido al inicio de sesión en un momento...</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResetPassword;
