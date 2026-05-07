import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./ReservaExitosa.css";

const ReservaExitosa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="success-main">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <span className="success-eyebrow">Reserva confirmada</span>
          <h1 className="success-title">¡Todo listo, {user?.nombre?.split(" ")[0]}!</h1>

          <div className="success-divider">
            <span className="success-divider-line" />
            <span className="success-divider-gem">✦</span>
            <span className="success-divider-line" />
          </div>

          <p className="success-sub">
            Tu reserva ha sido recibida con éxito. Te esperamos con los brazos abiertos
            y el mejor brunch de la ciudad.
          </p>

          <div className="success-actions">
            <button className="success-btn-primary" onClick={() => navigate("/")}>
              Volver al inicio
            </button>
            <button className="success-btn-secondary" onClick={() => navigate("/menu")}>
              Ver el menú
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ReservaExitosa;
