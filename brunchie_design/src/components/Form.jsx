import { useState } from "react";
import "../pages/ContactUs.css";

const Form = () => {
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState({ text: "", ok: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", ok: false });

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, mensaje }),
      });

      if (!res.ok) throw new Error();

      setMsg({ text: "¡Mensaje enviado! Te responderemos pronto.", ok: true });
      setNombre(""); setEmail(""); setTelefono(""); setMensaje("");
    } catch {
      setMsg({ text: "No se pudo enviar el mensaje. Inténtalo de nuevo.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="contact-form-inner" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Teléfono
        <input
          type="tel"
          placeholder="+57 300 000 0000"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </label>
      <label>
        Opinión
        <textarea
          placeholder="Cuéntanos qué te gustaría..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
        />
      </label>

      {msg.text && (
        <p className={msg.ok ? "contact-form-ok" : "contact-form-err"}>{msg.text}</p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
};

export default Form;
