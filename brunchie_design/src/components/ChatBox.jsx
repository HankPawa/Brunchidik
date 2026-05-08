import { useState, useRef, useEffect } from "react";
import "./ChatBox.css";

const WELCOME = {
  from: "bot",
  text: "¡Hola! 👋 Soy el asistente de Brunch & Co. Pregúntame sobre nuestro menú, horarios, reservas o cualquier otra duda.",
};

const RESPUESTAS = [
  { keys: ["hola", "buenas", "buenos", "hey", "saludos"],
    resp: "¡Hola! 👋 Bienvenido a Brunch & Co. ¿En qué puedo ayudarte hoy?" },
  { keys: ["horario", "hora", "abierto", "cierra", "abre"],
    resp: "Nuestro horario es: Lunes a Viernes de 8:00 a 15:00 y Sábados de 9:00 a 16:00. Los domingos permanecemos cerrados. ¡Te esperamos!" },
  { keys: ["menú", "menu", "comida", "plato", "comer", "desayuno", "almuerzo"],
    resp: "Tenemos desayunos y almuerzos preparados con ingredientes frescos. Puedes ver nuestro menú completo en la sección Menú de nuestra página." },
  { keys: ["reserva", "reservar", "mesa", "disponible"],
    resp: "¡Con gusto! Puedes hacer tu reserva en la sección Reservas de nuestra página. Disponible de lunes a sábado en horario de atención." },
  { keys: ["pedido", "domicilio", "delivery", "envío", "envio"],
    resp: "¡Sí hacemos pedidos a domicilio! Puedes realizar tu pedido desde la sección Menú durante nuestro horario de atención." },
  { keys: ["dirección", "direccion", "ubicación", "ubicacion", "donde", "dónde"],
    resp: "Nos encontramos en Calle del Sabor 123, Ciudad del Brunch. ¡Te esperamos!" },
  { keys: ["precio", "costo", "cuanto", "cuánto", "vale", "cobran"],
    resp: "Nuestros precios varían según el plato. Puedes consultar los precios en detalle en la sección de Menú." },
  { keys: ["gracias", "perfecto", "genial", "excelente", "listo"],
    resp: "¡Con mucho gusto! Si tienes alguna otra pregunta, aquí estaré. 😊" },
];

const responder = (texto) => {
  const lower = texto.toLowerCase();
  const match = RESPUESTAS.find(({ keys }) => keys.some((k) => lower.includes(k)));
  return match
    ? match.resp
    : "Gracias por escribirnos. Para consultas específicas contáctanos en horario de atención: Lun–Vie 8:00–15:00, Sáb 9:00–16:00.";
};

const ChatBox = () => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: responder(text) }]);
      setLoading(false);
    }, 700);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="chatbox">
      <div className="chatbox-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chatbox-bubble chatbox-bubble--${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="chatbox-bubble chatbox-bubble--bot chatbox-typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chatbox-input-row">
        <input
          className="chatbox-input"
          type="text"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          className="chatbox-send"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
