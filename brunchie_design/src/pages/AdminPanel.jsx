import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AdminPanel.css";

const EMPTY_FORM = { nombre: "", descripcion: "", precio: "", categoriaId: "", disponible: true, imagenUrl: "" };

const AdminPanel = () => {
  const [items, setItems]         = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState({ text: "", ok: false });

  const fetchData = () => {
    fetch("/api/admin/menu").then(r => r.json()).then(setItems);
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMsg({ text: "", ok: false });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      nombre:      item.nombre,
      descripcion: item.descripcion,
      precio:      item.precio,
      categoriaId: item.categoriaId || "",
      disponible:  item.disponible,
      imagenUrl:   item.imagenUrl || "",
    });
    setEditId(item.id);
    setMsg({ text: "", ok: false });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url    = editId ? `/api/admin/menu/${editId}` : "/api/admin/menu";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, precio: Number(form.precio), categoriaId: Number(form.categoriaId) }),
      });
      if (!res.ok) throw new Error();
      setMsg({ text: editId ? "Producto actualizado." : "Producto agregado.", ok: true });
      fetchData();
      setTimeout(() => setShowModal(false), 800);
    } catch {
      setMsg({ text: "Error al guardar el producto.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const catNombre = (id) => categorias.find(c => c.id === id)?.nombre || "—";

  return (
    <>
      <Navbar />
      <main className="admin-main">
        <div className="admin-wrapper">

          <div className="admin-header">
            <div>
              <span className="admin-eyebrow">Panel de administración</span>
              <h1 className="admin-title">Gestión de productos</h1>
            </div>
            <button className="admin-add-btn" onClick={openAdd}>+ Agregar producto</button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="admin-td-name">{item.nombre}</td>
                    <td>{catNombre(item.categoriaId)}</td>
                    <td>${Number(item.precio).toLocaleString("es-CO")}</td>
                    <td>
                      <span className={`admin-badge ${item.disponible ? "badge--green" : "badge--gray"}`}>
                        {item.disponible ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="admin-td-actions">
                      <button className="admin-btn-edit" onClick={() => openEdit(item)}>Editar</button>
                      <button className="admin-btn-delete" onClick={() => handleDelete(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
                <label>URL de imagen (opcional)</label>
                <input type="text" placeholder="https://..." value={form.imagenUrl} onChange={e => setForm({...form, imagenUrl: e.target.value})} />
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
