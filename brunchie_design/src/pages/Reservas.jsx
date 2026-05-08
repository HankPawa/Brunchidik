import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Reservas.css";

const Reservas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/reserva-exitosa");
  };

  return (
    <>
      <Navbar />
      <main className="reservas-main">
        <div className="reservas-card">
          <span className="reservas-eyebrow">Bienvenido, {user?.nombre}</span>
          <h1 className="reservas-title">Haz tu reserva</h1>
          <div className="reservas-divider">
            <span className="reservas-divider-line" />
            <span className="reservas-divider-gem">✦</span>
            <span className="reservas-divider-line" />
          </div>
          <p className="reservas-sub">Reserva tu mesa y disfruta la mejor experiencia brunch</p>

          <form className="reservas-form" onSubmit={handleSubmit}>
            <div className="reservas-row">
              <div className="reservas-field">
                <label>Nombre completo</label>
                <input type="text" defaultValue={user?.nombre} required />
              </div>
              <div className="reservas-field">
                <label>Correo electrónico</label>
                <input type="email" defaultValue={user?.email} required />
              </div>
            </div>
            <div className="reservas-row">
              <div className="reservas-field">
                <label>Fecha</label>
                <input type="date" required />
              </div>
              <div className="reservas-field">
                <label>Hora</label>
                <input type="time" min="08:00" max="17:00" required />
              </div>
            </div>
            <div className="reservas-row">
              <div className="reservas-field">
                <label>Número de personas</label>
                <select>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} persona{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="reservas-field">
                <label>Ocasión especial</label>
                <select>
                  <option value="">Sin ocasión especial</option>
                  <option value="cumpleanos">Cumpleaños</option>
                  <option value="aniversario">Aniversario</option>
                  <option value="negocios">Reunión de negocios</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="reservas-field">
              <label>Notas adicionales</label>
              <textarea placeholder="Alergias, preferencias, solicitudes especiales..." rows={3} />
            </div>
            <button type="submit" className="reservas-submit-btn">Confirmar reserva</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Reservas;
