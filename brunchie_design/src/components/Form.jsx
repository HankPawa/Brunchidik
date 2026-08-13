import { useState } from "react";
import toast from "react-hot-toast";
import "../pages/ContactUs.css";

const Form = () => {
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, mensaje }),
      });

      if (!res.ok) throw new Error();

      toast.success("¡Mensaje enviado! Te responderemos pronto.");
      setNombre(""); setEmail(""); setTelefono(""); setMensaje("");
    } catch {
      toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
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
          onChange={(e) => setNombre(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""))}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@#\-\.]/g, ""))}
          required
        />
      </label>
      <label>
        Teléfono
        <input
          type="tel"
          placeholder="3001234567"
          inputMode="numeric"
          maxLength={10}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
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

      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
};

export default Form;
