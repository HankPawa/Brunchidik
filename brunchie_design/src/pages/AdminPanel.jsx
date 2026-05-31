import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AdminPanel.css";

/* ── Helpers ── */
const exportCSV = (rows, cols, filename) => {
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r =>
    cols.map(c => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const blob = new Blob(["﻿" + [header, ...body].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Calendario de reservas ── */
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const CalendarioReservas = ({ reservas }) => {
  const [mes, setMes] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const { year, month } = mes;

  const byDay = reservas.reduce((acc, r) => {
    if (!r.fecha) return acc;
    const d = new Date(r.fecha + "T00:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      acc[day] = (acc[day] || []).concat(r);
    }
    return acc;
  }, {});

  const mesLabel = new Date(year, month).toLocaleString("es-CO", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMes = () => setMes(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const nextMes = () => setMes(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });

  return (
    <div className="reserva-cal-wrap">
      <div className="reserva-cal-header">
        <button className="reserva-cal-nav-btn" onClick={prevMes}>‹</button>
        <span className="reserva-cal-title">{mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)}</span>
        <button className="reserva-cal-nav-btn" onClick={nextMes}>›</button>
      </div>
      <div className="reserva-cal-grid">
        {DIAS_SEMANA.map(d => <div key={d} className="reserva-cal-weekday">{d}</div>)}
        {cells.map((day, idx) => (
          <div key={idx} className={`reserva-cal-day${!day ? " reserva-cal-day--empty" : ""}${day && byDay[day] ? " reserva-cal-day--has" : ""}`}>
            {day && (
              <>
                <span className="reserva-cal-daynum">{day}</span>
                {byDay[day] && <span className="reserva-cal-badge">{byDay[day].length}</span>}
              </>
            )}
          </div>
        ))}
      </div>
      {Object.keys(byDay).length === 0 && (
        <p className="admin-empty" style={{ padding: "1rem 0 0.5rem" }}>No hay reservas este mes.</p>
      )}
    </div>
  );
};

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

const confirmToast = (mensaje, onConfirm) => {
  toast(
    (t) => (
      <div style={{ fontFamily: "'Nunito',sans-serif" }}>
        <p style={{ margin: "0 0 .6rem", fontSize: ".9rem" }}>{mensaje}</p>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button
            style={{ flex: 1, padding: ".35rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: ".82rem" }}
            onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          >Confirmar</button>
          <button
            style={{ flex: 1, padding: ".35rem", background: "#f0ede8", color: "#1a1a1a", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: ".82rem" }}
            onClick={() => toast.dismiss(t.id)}
          >Cancelar</button>
        </div>
      </div>
    ),
    { duration: Infinity, icon: "⚠️" }
  );
};

const AdminPanel = () => {
  const [tab, setTab] = useState("productos");
  const [uploading, setUploading] = useState(false);
  useEffect(() => { document.title = "Admin | Brunch & Co."; }, []);

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
        toast.success("Imagen subida correctamente.");
      } else {
        const msg = json.error?.message || JSON.stringify(json);
        toast.error(`Error Cloudinary: ${msg}`);
      }
    } catch (err) {
      toast.error(`Error de conexión: ${err.message}`);
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
  const [reservas, setReservas]         = useState([]);
  const [filtroReservas, setFiltroRes]  = useState("");
  const [vistaReservas, setVistaRes]    = useState("tabla");

  // Pedidos
  const [pedidos, setPedidos]           = useState([]);
  const [filtroPedidos, setFiltroPed]   = useState("");

  // Audit log
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchProductos = () => {
    fetch("/api/admin/menu").then(r => r.json()).then(setItems);
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  };
  const fetchReservas  = () => fetch("/api/admin/reservas").then(r => r.json()).then(setReservas);
  const fetchPedidos   = () => fetch("/api/admin/pedidos").then(r => r.json()).then(setPedidos);
  const fetchAuditLogs = async () => {
    const [menu, pedidos] = await Promise.all([
      fetch("/api/admin/menu/audit").then(r => r.json()).catch(() => []),
      fetch("/api/admin/pedidos/audit").then(r => r.json()).catch(() => []),
    ]);
    const merged = [...menu, ...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setAuditLogs(merged);
  };

  useEffect(() => { fetchProductos(); fetchReservas(); fetchPedidos(); fetchAuditLogs(); }, []);

  // WebSocket: pedidos en tiempo real
  useWebSocket("/ws-pedidos", ["/topic/admin/pedidos", "/topic/admin/pedidos/estado"], (topic, data) => {
    if (topic === "/topic/admin/pedidos") {
      setPedidos(prev => {
        if (prev.some(p => p.id === data.id)) return prev;
        toast("Nuevo pedido recibido", { icon: "🔔", duration: 6000 });
        return [data, ...prev];
      });
    } else {
      setPedidos(prev => prev.map(p => p.id === data.id ? data : p));
    }
  });

  // WebSocket: reservas en tiempo real
  useWebSocket("/ws-reservas", ["/topic/admin/reservas"], (_topic, data) => {
    setReservas(prev => {
      if (prev.some(r => r.id === data.id)) return prev;
      toast("Nueva reserva recibida", { icon: "📅", duration: 6000 });
      return [data, ...prev];
    });
  });

  // ── Productos ──
  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setMsg({ text: "", ok: false }); setShowModal(true); };
  const openEdit = (item) => {
    setForm({ nombre: item.nombre, descripcion: item.descripcion, precio: item.precio,
              categoriaId: item.categoriaId || "", disponible: item.disponible, imagenUrl: item.imagenUrl || "" });
    setEditId(item.id); setMsg({ text: "", ok: false }); setShowModal(true);
  };
  const handleDelete = (id) => {
    confirmToast("¿Eliminar este producto?", async () => {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.status);
        toast.error(`Error al eliminar: ${res.status} — ${txt}`);
        return;
      }
      toast.success("Producto eliminado.");
      fetchProductos();
    });
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
      toast.success(editId ? "Producto actualizado." : "Producto agregado.");
      fetchProductos();
      setTimeout(() => setShowModal(false), 800);
    } catch { setMsg({ text: "Error al guardar el producto.", ok: false }); }
    finally { setLoading(false); }
  };
  const catNombre = (id) => categorias.find(c => c.id === id)?.nombre || "—";

  // ── Reservas ──
  const handleDeleteReserva = (id) => {
    confirmToast("¿Eliminar esta reserva?", async () => {
      await fetch(`/api/admin/reservas/${id}`, { method: "DELETE" });
      toast.success("Reserva eliminada.");
      fetchReservas();
    });
  };
  const handleEstadoReserva = async (id, estado) => {
    const res = await fetch(`/api/admin/reservas/${id}/estado?estado=${estado}`, { method: "PATCH" });
    if (!res.ok) {
      const txt = await res.text();
      toast.error(`Error al cambiar estado: ${res.status} - ${txt}`);
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

  // ── Report data (derived) ──
  const PIE_COLORS = ["#1a1a1a", "#c9a84c", "#4a90d9", "#e67e22", "#2ecc71", "#8e44ad"];
  const totalIngresos = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
  const productosActivos = items.filter(i => i.disponible).length;
  const pedidosPorEstado = ESTADOS_PEDIDO.map(est => ({
    name: { PENDIENTE: "Pendiente", EN_PREPARACION: "Preparando", EN_CAMINO: "En camino", ENTREGADO: "Entregado", CANCELADO: "Cancelado" }[est],
    value: pedidos.filter(p => p.estado === est).length,
  }));
  const metodoPagoData = Object.entries(
    pedidos.reduce((acc, p) => { const k = p.metodoPago || "Otro"; acc[k] = (acc[k] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));
  const ingresosData = Object.entries(
    pedidos.reduce((acc, p) => {
      const d = p.fechaProgramada
        ? new Date(p.fechaProgramada).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
        : "Sin fecha";
      acc[d] = (acc[d] || 0) + Number(p.total);
      return acc;
    }, {})
  ).map(([fecha, total]) => ({ fecha, total })).slice(-7);
  const reservasOcasionData = Object.entries(
    reservas.reduce((acc, r) => { const k = r.ocasion?.trim() || "Sin ocasión"; acc[k] = (acc[k] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const TABS = [
    { id: "productos",  label: "Productos" },
    { id: "reservas",   label: "Reservas",  count: reservas.length },
    { id: "pedidos",    label: "Pedidos",   count: pedidos.filter(p => p.estado === "PENDIENTE" || p.estado === "EN_PREPARACION").length },
    { id: "reportes",   label: "Reportes" },
    { id: "actividad",  label: "Actividad", count: auditLogs.length },
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
                {{ productos: "Gestión de productos", reservas: "Gestión de reservas", pedidos: "Gestión de pedidos", reportes: "Reportes y métricas", actividad: "Registro de actividad" }[tab]}
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

          {/* ── Tabla / Calendario Reservas ── */}
          {tab === "reservas" && (
            <>
              <div className="admin-tab-toolbar">
                <input
                  className="admin-filter-input"
                  type="text"
                  placeholder="Buscar por nombre, email o estado..."
                  value={filtroReservas}
                  onChange={e => setFiltroRes(e.target.value)}
                />
                <div className="admin-toolbar-right">
                  <div className="admin-vista-toggle">
                    <button className={`admin-vista-btn${vistaReservas === "tabla" ? " active" : ""}`} onClick={() => setVistaRes("tabla")}>Tabla</button>
                    <button className={`admin-vista-btn${vistaReservas === "calendario" ? " active" : ""}`} onClick={() => setVistaRes("calendario")}>Calendario</button>
                  </div>
                  <button className="admin-export-btn" onClick={() => exportCSV(reservas, [
                    { key: "id", label: "ID" }, { key: "nombre", label: "Cliente" }, { key: "email", label: "Email" },
                    { key: "fecha", label: "Fecha" }, { key: "hora", label: "Hora" }, { key: "personas", label: "Personas" },
                    { key: "ocasion", label: "Ocasión" }, { key: "estado", label: "Estado" },
                  ], `reservas_${new Date().toISOString().slice(0,10)}.csv`)}>
                    ↓ Exportar CSV
                  </button>
                </div>
              </div>

              {vistaReservas === "calendario" ? (
                <CalendarioReservas reservas={reservas} />
              ) : (
                <div className="admin-table-wrap">
                  {reservas.length === 0 ? <p className="admin-empty">No hay reservas registradas.</p> : (() => {
                    const q = filtroReservas.trim().toLowerCase();
                    const filtradas = q
                      ? reservas.filter(r => r.nombre?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.estado?.toLowerCase().includes(q))
                      : reservas;
                    return filtradas.length === 0 ? (
                      <p className="admin-empty">Sin resultados para "{filtroReservas}".</p>
                    ) : (
                      <table className="admin-table">
                        <thead><tr><th>Cliente</th><th>Email</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Ocasión</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                          {filtradas.map(r => (
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
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* ── Tabla Pedidos ── */}
          {tab === "pedidos" && (
            <>
              <div className="admin-tab-toolbar">
                <input
                  className="admin-filter-input"
                  type="text"
                  placeholder="Buscar por ID, dirección o estado..."
                  value={filtroPedidos}
                  onChange={e => setFiltroPed(e.target.value)}
                />
                <button className="admin-export-btn" onClick={() => exportCSV(pedidos, [
                  { key: "id", label: "ID" }, { key: "direccion", label: "Dirección" }, { key: "telefono", label: "Teléfono" },
                  { key: "metodoPago", label: "Método de pago" }, { key: "total", label: "Total" },
                  { key: "fechaProgramada", label: "Fecha programada" }, { key: "estado", label: "Estado" },
                ], `pedidos_${new Date().toISOString().slice(0,10)}.csv`)}>
                  ↓ Exportar CSV
                </button>
              </div>

              <div className="admin-table-wrap">
                {pedidos.length === 0 ? <p className="admin-empty">No hay pedidos registrados.</p> : (() => {
                  const q = filtroPedidos.trim().toLowerCase();
                  const filtrados = q
                    ? pedidos.filter(p => String(p.id).includes(q) || p.direccion?.toLowerCase().includes(q) || p.estado?.toLowerCase().includes(q))
                    : pedidos;
                  return filtrados.length === 0 ? (
                    <p className="admin-empty">Sin resultados para "{filtroPedidos}".</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>ID</th><th>Dirección</th><th>Teléfono</th><th>Pago</th><th>Total</th><th>Programado</th><th>Estado</th></tr></thead>
                      <tbody>
                        {filtrados.map(p => (
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
                  );
                })()}
              </div>
            </>
          )}

          {/* ── Reportes ── */}
          {tab === "reportes" && (
            <div className="report-wrap">

              {/* KPI cards */}
              <div className="report-kpi-row">
                <div className="report-kpi-card">
                  <span className="report-kpi-value">{pedidos.length}</span>
                  <span className="report-kpi-label">Pedidos totales</span>
                </div>
                <div className="report-kpi-card report-kpi-card--accent">
                  <span className="report-kpi-value">${totalIngresos.toLocaleString("es-CO")}</span>
                  <span className="report-kpi-label">Ingresos totales</span>
                </div>
                <div className="report-kpi-card">
                  <span className="report-kpi-value">{reservas.length}</span>
                  <span className="report-kpi-label">Reservas totales</span>
                </div>
                <div className="report-kpi-card">
                  <span className="report-kpi-value">{productosActivos}</span>
                  <span className="report-kpi-label">Productos activos</span>
                </div>
              </div>

              {/* Charts row 1 */}
              <div className="report-charts-row">
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Pedidos por estado</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pedidosPorEstado} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                      <XAxis dataKey="name" tick={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fill: "#999" }} />
                      <YAxis allowDecimals={false} tick={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fill: "#999" }} />
                      <Tooltip contentStyle={{ fontFamily: "'Nunito',sans-serif", borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }} />
                      <Bar dataKey="value" name="Pedidos" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                  <h3 className="report-chart-title">Método de pago</h3>
                  {metodoPagoData.length === 0
                    ? <p className="admin-empty" style={{ padding: "3rem 0" }}>Sin datos aún</p>
                    : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={metodoPagoData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                            {metodoPagoData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontFamily: "'Nunito',sans-serif", borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                </div>
              </div>

              {/* Charts row 2 */}
              <div className="report-charts-row">
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Ingresos por fecha</h3>
                  {ingresosData.length === 0
                    ? <p className="admin-empty" style={{ padding: "3rem 0" }}>Sin datos aún</p>
                    : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ingresosData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                          <XAxis dataKey="fecha" tick={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fill: "#999" }} />
                          <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fill: "#999" }} />
                          <Tooltip formatter={v => [`$${Number(v).toLocaleString("es-CO")}`, "Ingresos"]} contentStyle={{ fontFamily: "'Nunito',sans-serif", borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }} />
                          <Bar dataKey="total" name="Ingresos" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>

                <div className="report-chart-card">
                  <h3 className="report-chart-title">Reservas por ocasión</h3>
                  {reservasOcasionData.length === 0
                    ? <p className="admin-empty" style={{ padding: "3rem 0" }}>Sin datos aún</p>
                    : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={reservasOcasionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                            {reservasOcasionData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontFamily: "'Nunito',sans-serif", borderRadius: 8, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                </div>
              </div>

            </div>
          )}

          {/* ── Actividad ── */}
          {tab === "actividad" && (
            <div className="admin-table-wrap" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <button className="admin-btn-edit" onClick={fetchAuditLogs} style={{ fontSize: ".8rem" }}>↻ Actualizar</button>
              </div>
              {auditLogs.length === 0 ? (
                <p className="admin-empty" style={{ padding: "3rem 0" }}>Sin actividad registrada aún.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                  {auditLogs.map((log, i) => {
                    const cfg = {
                      CREAR_PRODUCTO:     { icon: "＋", color: "#2ecc71", bg: "#002a14" },
                      EDITAR_PRODUCTO:    { icon: "✎",  color: "#4a90d9", bg: "#001a2a" },
                      ELIMINAR_PRODUCTO:  { icon: "✕",  color: "#e05050", bg: "#2a0a0a" },
                      CAMBIAR_ESTADO_PEDIDO: { icon: "↻", color: "#c9a84c", bg: "#2a1f0e" },
                    }[log.accion] || { icon: "•", color: "#888", bg: "#1e1e1e" };
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: ".9rem 1rem", background: "var(--audit-bg, #f9f7f4)", borderRadius: "12px", border: "1px solid var(--audit-border, #ede9e3)" }}>
                        <span style={{ width: 32, height: 32, borderRadius: "50%", background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, fontWeight: 700 }}>{cfg.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontFamily: "'Nunito',sans-serif", fontSize: ".9rem", fontWeight: 700, color: "inherit" }}>{log.detalle}</p>
                          <p style={{ margin: ".2rem 0 0", fontFamily: "'Nunito',sans-serif", fontSize: ".75rem", color: "#888" }}>
                            {new Date(log.fecha).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            <span style={{ marginLeft: ".6rem", padding: ".1rem .5rem", borderRadius: "50px", background: cfg.bg, color: cfg.color, fontSize: ".7rem", fontWeight: 700 }}>{log.servicio}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
