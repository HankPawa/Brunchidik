import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Reservas.css";

const ESTADO_BADGE = {
  PENDIENTE:  { label: "Pendiente",  css: "badge--yellow" },
  CONFIRMADA: { label: "Confirmada", css: "badge--green"  },
  CANCELADA:  { label: "Cancelada",  css: "badge--gray"   },
};

const Reservas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]           = useState(user?.nombre || "");
  const [email, setEmail]             = useState(user?.email || "");
  const [fecha, setFecha]             = useState("");
  const [hora, setHora]               = useState("");
  const [personas, setPersonas]       = useState(1);
  const [ocasion, setOcasion]         = useState("");
  const [notas, setNotas]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [misReservas, setMisReservas] = useState([]);

  useEffect(() => { document.title = "Reservas | Brunch & Co."; }, []);
  const today = new Date().toISOString().split("T")[0];

  const fetchMisReservas = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/reservas/usuario/${user.id}`);
      if (res.ok) setMisReservas(await res.json());
    } catch {}
  };

  useEffect(() => { fetchMisReservas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, email, fecha, hora,
          personas: Number(personas),
          ocasion, notas,
          usuarioId: user.id,
        }),
      });
      if (!res.ok) throw new Error();
      navigate("/reserva-exitosa");
    } catch {
      toast.error("No se pudo crear la reserva. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    const res = await fetch(`/api/reservas/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Reserva cancelada correctamente.");
      fetchMisReservas();
    } else {
      toast.error("No se pudo cancelar la reserva.");
    }
  };

  const formatFecha = (f) =>
    new Date(f + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <Navbar />
      <main className="reservas-main">
        <div className="reservas-wrapper">

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
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => {
                      const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                      setNombre(soloLetras);
                    }} 
                    required 
                  />
                </div>
                <div className="reservas-field">
                  <label>Correo electrónico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@#\-\.]/g, ""))} required />
                </div>
              </div>
              <div className="reservas-row">
                <div className="reservas-field">
                  <label>Fecha</label>
                  <input type="date" min={today} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
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

              <button type="submit" className="reservas-submit-btn" disabled={loading}>
                {loading ? "Enviando..." : "Confirmar reserva"}
              </button>
            </form>
          </div>

          {misReservas.length > 0 && (
            <div className="mis-reservas">
              <h2 className="mis-reservas-title">Mis reservas</h2>
              <div className="mis-reservas-list">
                {misReservas.map((r) => {
                  const badge = ESTADO_BADGE[r.estado] || ESTADO_BADGE.PENDIENTE;
                  return (
                    <div key={r.id} className="mis-reservas-item">
                      <div className="mis-reservas-info">
                        <span className="mis-reservas-fecha">{formatFecha(r.fecha)} — {r.hora?.slice(0,5)}</span>
                        <span className="mis-reservas-personas">{r.personas} persona{r.personas > 1 ? "s" : ""}{r.ocasion ? ` · ${r.ocasion}` : ""}</span>
                      </div>
                      <div className="mis-reservas-actions">
                        <span className={`reserva-badge ${badge.css}`}>{badge.label}</span>
                        {r.estado !== "CANCELADA" && (
                          <button className="mis-reservas-cancelar" onClick={() => handleCancelar(r.id)}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Reservas;
