const features = [
  {
    icon: "🐾",
    title: "Pet friendly",
    desc: "Tu mascota es bienvenida",
    bg: "#FFF3E0",
  },
  {
    icon: "🕒",
    title: "Abierto todo el día",
    desc: "Disfruta a cualquier hora",
    bg: "#F3E5F5",
  },
  {
    icon: "📍",
    title: "Ubicación céntrica",
    desc: "Fácil acceso en la ciudad",
    bg: "#E8F5E9",
  },
];

const Features = () => {
  return (
    <section className="section">
      <div className="columns is-centered">
        {features.map((f) => (
          <div className="column is-3" key={f.title}>
            <div
              className="box has-text-centered feature-box"
              style={{ backgroundColor: f.bg, border: "none", borderRadius: "20px" }}
            >
              <p style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>{f.icon}</p>
              <p className="title is-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                {f.title}
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", color: "#666" }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
