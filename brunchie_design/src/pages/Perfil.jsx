import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Perfil.css";

const ESTADO_BADGE = {
  PENDIENTE:      "badge--yellow",
  EN_PREPARACION: "badge--blue",
  EN_CAMINO:      "badge--orange",
  ENTREGADO:      "badge--green",
  CANCELADO:      "badge--gray",
};

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
const fmtFecha = (dt) => new Date(dt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

const Perfil = () => {
  const { user, toggle2fa, logout, changePassword } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos]         = useState([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);

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
  const [pwMsg, setPwMsg]         = useState({ text: "", ok: false });
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwNueva !== pwConfirm) {
      setPwMsg({ text: "Las contraseñas nuevas no coinciden.", ok: false });
      return;
    }
    setPwLoading(true);
    const result = await changePassword(pwActual, pwNueva);
    setPwLoading(false);
    setPwMsg(result);
    if (result.ok) { setPwActual(""); setPwNueva(""); setPwConfirm(""); }
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
              <h1 className="perfil-nombre">{user?.nombre}</h1>
              <p className="perfil-email">{user?.email}</p>
            </div>
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
                {pwMsg.text && (
                  <p className={`perfil-msg ${pwMsg.ok ? "perfil-msg--ok" : "perfil-msg--err"}`}>{pwMsg.text}</p>
                )}
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
                onClick={() => toggle2fa(!user?.dosFaActivo)}
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
                        <span className={`badge ${ESTADO_BADGE[p.estado] || "badge--gray"}`}>
                          {p.estado?.replace("_", " ")}
                        </span>
                      </div>
                      <div className="perfil-pedido-info">
                        <span>{fmtFecha(p.fechaCreacion)}</span>
                        <span>{p.direccion}</span>
                        <span className="perfil-pedido-total">{fmt(p.total)}</span>
                      </div>
                      {p.fechaProgramada && (
                        <p className="perfil-pedido-programado">
                          Programado para: {new Date(p.fechaProgramada).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                        </p>
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
