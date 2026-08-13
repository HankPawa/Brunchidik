import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useWebSocket } from "../hooks/useWebSocket";
import "./Perfil.css";

const ESTADO_BADGE = {
  PENDIENTE:      "badge--yellow",
  EN_PREPARACION: "badge--blue",
  EN_CAMINO:      "badge--orange",
  ENTREGADO:      "badge--green",
  CANCELADO:      "badge--gray",
};

const TIMELINE_STEPS = ["PENDIENTE", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO"];
const TIMELINE_LABELS = { PENDIENTE: "Pendiente", EN_PREPARACION: "Preparando", EN_CAMINO: "En camino", ENTREGADO: "Entregado" };

const OrderTimeline = ({ estado }) => {
  if (estado === "CANCELADO") {
    return <p className="perfil-pedido-cancelado">✕ Pedido cancelado</p>;
  }
  const activeIdx = TIMELINE_STEPS.indexOf(estado);
  return (
    <div className="pedido-timeline">
      {TIMELINE_STEPS.map((step, idx) => (
        <div key={step} className={`pedido-timeline-step${idx <= activeIdx ? " active" : ""}${idx === activeIdx ? " current" : ""}`}>
          <div className="pedido-timeline-dot" />
          {idx < TIMELINE_STEPS.length - 1 && <div className="pedido-timeline-line" />}
          <span className="pedido-timeline-label">{TIMELINE_LABELS[step]}</span>
        </div>
      ))}
    </div>
  );
};

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
const fmtFecha = (dt) => new Date(dt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

const Countdown = ({ fechaProgramada }) => {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(fechaProgramada) - Date.now();
      if (diff <= 0) { setLabel("¡En camino!"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(h > 0 ? `Llega en ${h}h ${m}min` : `Llega en ${m}min ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [fechaProgramada]);
  return <span className="perfil-countdown">{label}</span>;
};

const Perfil = () => {
  const { user, toggle2fa, logout, changePassword, actualizarUsuario } = useAuth();
  const { favorites, toggle: toggleFav } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => { document.title = "Mi perfil | Brunch & Co."; }, []);

  const [pedidos, setPedidos]               = useState([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [cancelandoSus, setCancelándoSus]   = useState(false);

  const wsTopic = useMemo(
    () => (user?.id ? [`/topic/usuario/${user.id}/pedido`] : []),
    [user?.id]
  );
  useWebSocket("/ws-pedidos", wsTopic, (_topic, data) => {
    setPedidos(prev => prev.map(p => p.id === data.id ? data : p));
  });

  const handleCancelarSuscripcion = async () => {
    if (!confirm("¿Seguro que quieres cancelar tu suscripción Premium?")) return;
    setCancelándoSus(true);
    try {
      const res = await fetch(`/api/usuarios/${user.id}/suscripcion?activo=false`, { method: "PATCH" });
      if (res.ok) {
        actualizarUsuario({ suscrito: false });
        toast.success("Suscripción Premium cancelada.");
      } else {
        toast.error("No se pudo cancelar la suscripción.");
      }
    } catch {
      toast.error("No se pudo cancelar la suscripción.");
    } finally {
      setCancelándoSus(false);
    }
  };

  useEffect(() => {
    if (!user?.suscrito || !user?.id) return;
    setPedidosLoading(true);
    fetch(`/api/pedidos/usuario/${user.id}`)
      .then(r => r.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => setPedidos([]))
      .finally(() => setPedidosLoading(false));
  }, [user?.id, user?.suscrito]);

  const [pwActual, setPwActual]   = useState("");
  const [pwNueva, setPwNueva]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwNueva !== pwConfirm) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPwLoading(true);
    const result = await changePassword(pwActual, pwNueva);
    setPwLoading(false);
    if (result.ok) {
      toast.success(result.text);
      setPwActual(""); setPwNueva(""); setPwConfirm("");
    } else {
      toast.error(result.text);
    }
  };

  const initiales = user?.nombre
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <Navbar />
      <main className="perfil-main">
        <div className="perfil-wrapper">

          {/* Header */}
          <div className="perfil-header">
            <div className="perfil-avatar">{initiales}</div>
            <div>
              <h1 className="perfil-nombre">
                {user?.nombre}
                {user?.suscrito && <span className="perfil-premium-tag">✦ Premium</span>}
              </h1>
              <p className="perfil-email">{user?.email}</p>
            </div>
            {user?.suscrito && (
              <button
                className="perfil-btn-cancelar-sus"
                onClick={handleCancelarSuscripcion}
                disabled={cancelandoSus}
              >
                {cancelandoSus ? "Cancelando..." : "Cancelar Premium"}
              </button>
            )}
          </div>

          {/* Información */}
          <section className="perfil-card">
            <h2 className="perfil-section-title">Información de la cuenta</h2>
            <div className="perfil-divider">
              <span className="perfil-divider-line" />
              <span className="perfil-divider-gem">✦</span>
              <span className="perfil-divider-line" />
            </div>
            <div className="perfil-info-grid">
              <div className="perfil-info-item">
                <span className="perfil-info-label">Nombre completo</span>
                <span className="perfil-info-value">{user?.nombre}</span>
              </div>
              <div className="perfil-info-item">
                <span className="perfil-info-label">Correo electrónico</span>
                <span className="perfil-info-value">{user?.email}</span>
              </div>
              <div className="perfil-info-item">
                <span className="perfil-info-label">ID de usuario</span>
                <span className="perfil-info-value perfil-info-muted">#{user?.id}</span>
              </div>
            </div>
          </section>

          {/* Cambiar contraseña - solo para cuentas propias */}
          {user?.cuentaGoogle ? (
            <section className="perfil-card perfil-card--google">
              <div className="perfil-google-row">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="perfil-google-icon" />
                <div>
                  <span className="perfil-google-title">Cuenta vinculada con Google</span>
                  <span className="perfil-google-desc">
                    Tu contraseña es gestionada por Google. Para cambiarla visita{" "}
                    <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">
                      myaccount.google.com
                    </a>
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <section className="perfil-card">
              <h2 className="perfil-section-title">Cambiar contraseña</h2>
              <div className="perfil-divider">
                <span className="perfil-divider-line" />
                <span className="perfil-divider-gem">✦</span>
                <span className="perfil-divider-line" />
              </div>
              <form className="perfil-pw-form" onSubmit={handleChangePassword}>
                <div className="perfil-field">
                  <label>Contraseña actual</label>
                  <input type="password" placeholder="••••••••" value={pwActual} onChange={(e) => setPwActual(e.target.value)} required />
                </div>
                <div className="perfil-field">
                  <label>Nueva contraseña</label>
                  <input type="password" placeholder="••••••••" value={pwNueva} onChange={(e) => setPwNueva(e.target.value)} required />
                </div>
                <div className="perfil-field">
                  <label>Confirmar nueva contraseña</label>
                  <input type="password" placeholder="••••••••" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} required />
                </div>
                <button type="submit" className="perfil-btn-pw" disabled={pwLoading}>
                  {pwLoading ? "Guardando..." : "Guardar contraseña"}
                </button>
              </form>
            </section>
          )}

          {/* Seguridad 2FA */}
          <section className="perfil-card">
            <h2 className="perfil-section-title">Seguridad</h2>
            <div className="perfil-divider">
              <span className="perfil-divider-line" />
              <span className="perfil-divider-gem">✦</span>
              <span className="perfil-divider-line" />
            </div>
            <div className="perfil-2fa-row">
              <div className="perfil-2fa-info">
                <span className="perfil-2fa-title">Autenticación de dos pasos</span>
                <span className="perfil-2fa-desc">
                  {user?.dosFaActivo
                    ? "Activa — se pedirá un código al iniciar sesión."
                    : "Inactiva — el acceso solo requiere tu contraseña."}
                </span>
              </div>
              <button
                className={`perfil-toggle ${user?.dosFaActivo ? "perfil-toggle--on" : ""}`}
                onClick={async () => {
                  const res = await toggle2fa(!user?.dosFaActivo);
                  if (res?.ok) toast.success(res.activo ? "2FA activada correctamente." : "2FA desactivada.");
                  else toast.error("No se pudo cambiar la configuración de 2FA.");
                }}
              >
                <span className="perfil-toggle-thumb" />
              </button>
            </div>
            <div className="perfil-2fa-badge">
              {user?.dosFaActivo
                ? <span className="badge badge--green">2FA activada</span>
                : <span className="badge badge--gray">2FA desactivada</span>}
            </div>
          </section>

          {/* Historial de pedidos — solo premium */}
          {user?.suscrito ? (
            <section className="perfil-card">
              <h2 className="perfil-section-title">Historial de pedidos</h2>
              <div className="perfil-divider">
                <span className="perfil-divider-line" />
                <span className="perfil-divider-gem">✦</span>
                <span className="perfil-divider-line" />
              </div>

              {pedidosLoading ? (
                <p className="perfil-historial-empty">Cargando pedidos...</p>
              ) : pedidos.length === 0 ? (
                <p className="perfil-historial-empty">Aún no tienes pedidos registrados.</p>
              ) : (
                <div className="perfil-historial-wrap">
                  {pedidos.map(p => (
                    <div key={p.id} className="perfil-pedido-card">
                      <div className="perfil-pedido-header">
                        <span className="perfil-pedido-id">Pedido #{p.id}</span>
                        <span className="perfil-pedido-fecha">{fmtFecha(p.fechaCreacion)}</span>
                      </div>
                      <div className="perfil-pedido-info">
                        <span>{p.direccion}</span>
                        <span className="perfil-pedido-total">{fmt(p.total)}</span>
                      </div>
                      <OrderTimeline estado={p.estado} />
                      {p.fechaProgramada && (
                        <div className="perfil-pedido-programado-row">
                          <span className="perfil-pedido-programado">
                            {new Date(p.fechaProgramada).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          {p.estado !== "ENTREGADO" && p.estado !== "CANCELADO" && (
                            <Countdown fechaProgramada={p.fechaProgramada} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="perfil-card perfil-card--premium-hint">
              <span className="perfil-premium-icon">✦</span>
              <div>
                <p className="perfil-premium-title">Historial de pedidos</p>
                <p className="perfil-premium-sub">Disponible para miembros Premium.</p>
              </div>
              <Link to="/suscripcion" className="perfil-premium-btn">Ver planes</Link>
            </section>
          )}

          {/* Favoritos */}
          {favorites.length > 0 && (
            <section className="perfil-card">
              <h2 className="perfil-section-title">Mis favoritos</h2>
              <div className="perfil-divider">
                <span className="perfil-divider-line" />
                <span className="perfil-divider-gem">✦</span>
                <span className="perfil-divider-line" />
              </div>
              <div className="perfil-favoritos-grid">
                {favorites.map(item => (
                  <div key={item.id} className="perfil-fav-item">
                    {item.imagenUrl && (
                      <img src={item.imagenUrl} alt={item.nombre} className="perfil-fav-img" />
                    )}
                    <div className="perfil-fav-info">
                      <span className="perfil-fav-nombre">{item.nombre}</span>
                      <span className="perfil-fav-precio">${Number(item.precio).toLocaleString("es-CO")}</span>
                    </div>
                    <button className="perfil-fav-remove" onClick={() => toggleFav(item)} aria-label="Quitar de favoritos">♥</button>
                  </div>
                ))}
              </div>
              <Link to="/menu" className="perfil-fav-link">Ver menú completo</Link>
            </section>
          )}

          {/* Cerrar sesión */}
          <section className="perfil-card perfil-card--actions">
            <button className="perfil-btn-logout" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Perfil;
