import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Reservas.css";

const Reservas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]     = useState(user?.nombre || "");
  const [email, setEmail]       = useState(user?.email || "");
  const [fecha, setFecha]       = useState("");
  const [hora, setHora]         = useState("");
  const [personas, setPersonas] = useState(1);
  const [ocasion, setOcasion]   = useState("");
  const [notas, setNotas]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          fecha,
          hora,
          personas: Number(personas),
          ocasion,
          notas,
          usuario: { id: user.id },
        }),
      });

      if (!res.ok) throw new Error("Error al crear la reserva");
      navigate("/reserva-exitosa");
    } catch {
      setError("No se pudo crear la reserva. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
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
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="reservas-field">
                <label>Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="reservas-row">
              <div className="reservas-field">
                <label>Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="reservas-field">
                <label>Hora</label>
                <input type="time" min="08:00" max="17:00" value={hora} onChange={(e) => setHora(e.target.value)} required />
              </div>
            </div>
            <div className="reservas-row">
              <div className="reservas-field">
                <label>Número de personas</label>
                <select value={personas} onChange={(e) => setPersonas(e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} persona{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="reservas-field">
                <label>Ocasión especial</label>
                <select value={ocasion} onChange={(e) => setOcasion(e.target.value)}>
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
              <textarea
                placeholder="Alergias, preferencias, solicitudes especiales..."
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {error && <p className="reservas-error">{error}</p>}

            <button type="submit" className="reservas-submit-btn" disabled={loading}>
              {loading ? "Enviando..." : "Confirmar reserva"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Reservas;
