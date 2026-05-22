import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AdminPanel.css";

const CLOUDINARY_CLOUD = "dwhezsxkg";
const CLOUDINARY_PRESET = "brunch_menu";

const EMPTY_FORM = { nombre: "", descripcion: "", precio: "", categoriaId: "", disponible: true, imagenUrl: "" };

const ESTADOS_PEDIDO   = ["PENDIENTE", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO", "CANCELADO"];
const ESTADOS_RESERVA  = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];

const BADGE_PEDIDO = {
  PENDIENTE:       "badge--yellow",
  EN_PREPARACION:  "badge--blue",
  EN_CAMINO:       "badge--orange",
  ENTREGADO:       "badge--green",
  CANCELADO:       "badge--gray",
};

const AdminPanel = () => {
  const [tab, setTab] = useState("productos");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e, setForm) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_PRESET);
    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: data });
      const json = await res.json();
      if (json.secure_url) {
        setForm(prev => ({ ...prev, imagenUrl: json.secure_url }));
      } else {
        const msg = json.error?.message || JSON.stringify(json);
        alert(`Error Cloudinary: ${msg}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Productos
  const [items, setItems]           = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState({ text: "", ok: false });

  // Reservas
  const [reservas, setReservas] = useState([]);

  // Pedidos
  const [pedidos, setPedidos] = useState([]);

  const fetchProductos = () => {
    fetch("/api/admin/menu").then(r => r.json()).then(setItems);
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  };
  const fetchReservas = () => fetch("/api/admin/reservas").then(r => r.json()).then(setReservas);
  const fetchPedidos  = () => fetch("/api/admin/pedidos").then(r => r.json()).then(setPedidos);

  useEffect(() => { fetchProductos(); fetchReservas(); fetchPedidos(); }, []);

  // ── Productos ──
  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setMsg({ text: "", ok: false }); setShowModal(true); };
  const openEdit = (item) => {
    setForm({ nombre: item.nombre, descripcion: item.descripcion, precio: item.precio,
              categoriaId: item.categoriaId || "", disponible: item.disponible, imagenUrl: item.imagenUrl || "" });
    setEditId(item.id); setMsg({ text: "", ok: false }); setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.status);
      alert(`Error al eliminar: ${res.status} — ${txt}`);
      return;
    }
    fetchProductos();
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const url = editId ? `/api/admin/menu/${editId}` : "/api/admin/menu";
    const method = editId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, precio: Number(form.precio), categoriaId: Number(form.categoriaId) }) });
      if (!res.ok) throw new Error();
      setMsg({ text: editId ? "Producto actualizado." : "Producto agregado.", ok: true });
      fetchProductos();
      setTimeout(() => setShowModal(false), 800);
    } catch { setMsg({ text: "Error al guardar el producto.", ok: false }); }
    finally { setLoading(false); }
  };
  const catNombre = (id) => categorias.find(c => c.id === id)?.nombre || "—";

  // ── Reservas ──
  const handleDeleteReserva = async (id) => {
    if (!confirm("¿Eliminar esta reserva?")) return;
    await fetch(`/api/admin/reservas/${id}`, { method: "DELETE" });
    fetchReservas();
  };
  const handleEstadoReserva = async (id, estado) => {
    const res = await fetch(`/api/admin/reservas/${id}/estado?estado=${estado}`, { method: "PATCH" });
    if (!res.ok) {
      const txt = await res.text();
      alert(`Error al cambiar estado: ${res.status} - ${txt}`);
    }
    fetchReservas();
  };
  const formatFecha = (f) => new Date(f + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const formatHora  = (h) => h?.slice(0, 5);

  // ── Pedidos ──
  const handleEstadoPedido = async (id, estado) => {
    await fetch(`/api/admin/pedidos/${id}/estado?estado=${estado}`, { method: "PATCH" });
    fetchPedidos();
  };

  const TABS = [
    { id: "productos", label: "Productos" },
    { id: "reservas",  label: "Reservas",  count: reservas.length },
    { id: "pedidos",   label: "Pedidos",   count: pedidos.filter(p => p.estado === "PENDIENTE" || p.estado === "EN_PREPARACION").length },
  ];

  return (
    <>
      <Navbar />
      <main className="admin-main">
        <div className="admin-wrapper">

          <div className="admin-header">
            <div>
              <span className="admin-eyebrow">Panel de administración</span>
              <h1 className="admin-title">
                {{ productos: "Gestión de productos", reservas: "Gestión de reservas", pedidos: "Gestión de pedidos" }[tab]}
              </h1>
            </div>
            {tab === "productos" && (
              <button className="admin-add-btn" onClick={openAdd}>+ Agregar producto</button>
            )}
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`admin-tab ${tab === t.id ? "admin-tab--active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
                {t.count > 0 && <span className="admin-tab-count">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ── Tabla Productos ── */}
          {tab === "productos" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Disponible</th><th>Acciones</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="admin-td-name">{item.nombre}</td>
                      <td>{catNombre(item.categoriaId)}</td>
                      <td>${Number(item.precio).toLocaleString("es-CO")}</td>
                      <td><span className={`admin-badge ${item.disponible ? "badge--green" : "badge--gray"}`}>{item.disponible ? "Sí" : "No"}</span></td>
                      <td className="admin-td-actions">
                        <button className="admin-btn-edit" onClick={() => openEdit(item)}>Editar</button>
                        <button className="admin-btn-delete" onClick={() => handleDelete(item.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Tabla Reservas ── */}
          {tab === "reservas" && (
            <div className="admin-table-wrap">
              {reservas.length === 0 ? <p className="admin-empty">No hay reservas registradas.</p> : (
                <table className="admin-table">
                  <thead><tr><th>Cliente</th><th>Email</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Ocasión</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {reservas.map(r => (
                      <tr key={r.id}>
                        <td className="admin-td-name">{r.nombre}</td>
                        <td>{r.email}</td>
                        <td>{formatFecha(r.fecha)}</td>
                        <td>{formatHora(r.hora)}</td>
                        <td>{r.personas}</td>
                        <td>{r.ocasion || "—"}</td>
                        <td>
                          <select className="admin-estado-select" value={r.estado || "PENDIENTE"} onChange={ev => handleEstadoReserva(r.id, ev.target.value)}>
                            {ESTADOS_RESERVA.map(est => <option key={est} value={est}>{est.charAt(0) + est.slice(1).toLowerCase()}</option>)}
                          </select>
                        </td>
                        <td className="admin-td-actions">
                          <button className="admin-btn-delete" onClick={() => handleDeleteReserva(r.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Tabla Pedidos ── */}
          {tab === "pedidos" && (
            <div className="admin-table-wrap">
              {pedidos.length === 0 ? <p className="admin-empty">No hay pedidos registrados.</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Dirección</th><th>Teléfono</th><th>Pago</th><th>Total</th><th>Programado</th><th>Estado</th></tr></thead>
                  <tbody>
                    {pedidos.map(p => (
                      <tr key={p.id}>
                        <td className="admin-td-name">#{p.id}</td>
                        <td>{p.direccion}</td>
                        <td>{p.telefono}</td>
                        <td>{p.metodoPago}</td>
                        <td>${Number(p.total).toLocaleString("es-CO")}</td>
                        <td>{p.fechaProgramada ? new Date(p.fechaProgramada).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                        <td>
                          <select className="admin-estado-select" value={p.estado} onChange={e => handleEstadoPedido(p.id, e.target.value)}>
                            {ESTADOS_PEDIDO.map(e => { const label = e.replaceAll("_", " "); return <option key={e} value={e}>{label.charAt(0) + label.slice(1).toLowerCase()}</option>; })}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Modal productos */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-modal-title">{editId ? "Editar producto" : "Agregar producto"}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-field">
                <label>Nombre</label>
                <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="admin-field">
                <label>Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>
              <div className="admin-row">
                <div className="admin-field">
                  <label>Precio (COP)</label>
                  <input type="number" min="0" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Categoría</label>
                  <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} required>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Imagen</label>
                <div className="admin-img-upload">
                  <label className="admin-img-upload-btn">
                    {uploading ? "Subiendo..." : "📁 Subir archivo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, setForm)} disabled={uploading} />
                  </label>
                  <input type="text" placeholder="O pega una URL..." value={form.imagenUrl} onChange={e => setForm({...form, imagenUrl: e.target.value})} />
                </div>
                {form.imagenUrl && <img src={form.imagenUrl} alt="preview" className="admin-img-preview" />}
              </div>
              <div className="admin-check-row">
                <label className="admin-check-label">
                  <input type="checkbox" checked={form.disponible} onChange={e => setForm({...form, disponible: e.target.checked})} />
                  Disponible en el menú
                </label>
              </div>
              {msg.text && <p className={`admin-msg ${msg.ok ? "admin-msg--ok" : "admin-msg--err"}`}>{msg.text}</p>}
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-save" disabled={loading}>
                  {loading ? "Guardando..." : editId ? "Guardar cambios" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AdminPanel;
