import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import englisheggs from "../assets/englisheggs.jpg";
import torrejon from "../assets/torrejon.jpg";
import baconeggs from "../assets/baconeggs.webp";
import eggs from "../assets/eggs.jpg";
import "./Menu.css";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    name: "Desayunos Clásicos",
    items: [
      {
        name: "Pancakes",
        price: "$12.900",
        img: pancakes,
        desc: "Una torre de cuatro pancakes dorados y extra esponjosos, bañados con miel de abejas pura y azúcar glass. Coronados con frambuesas frescas, arándanos azules y láminas de almendra tostada.",
      },
      {
        name: "Bacon Eggs",
        price: "$18.900",
        img: baconeggs,
        desc: "Tiras de tocineta premium ahumada en madera de nogal, cocinadas hasta el punto exacto de crocancia, acompañadas de un huevo frito con yema sedosa que resalta los sabores salados del conjunto.",
      },
      {
        name: "Muffin Inglés con Huevos",
        price: "$21.000",
        img: englisheggs,
        desc: "Muffin inglés artesanal tostado con huevos revueltos cremosos sazonados con pimienta negra molida. Acompañado de tomates cherry en rama asados para resaltar su dulzor natural.",
      },
    ],
  },
  {
    name: "Brunch",
    items: [
      {
        name: "Avocado Toast Campestre",
        price: "$30.000",
        img: avocado,
        desc: "Pan de masa madre tostado con crema de aguacate y salteado de vegetales frescos: maíz tierno, pimentón y cebollas caramelizadas. Terminado con romero fresco y pimienta negra recién molida.",
      },
      {
        name: "Eggs Benedict",
        price: "$29.900",
        img: eggs,
        desc: "Dos huevos pochados sobre muffins ingleses tostados y jamón de espalda premium. Bañados en salsa holandesa de la casa con páprika, acompañados de rúcula, tomates cherry y cebolla morada.",
      },
      {
        name: "Torrijas de Ricotta",
        price: "$26.000",
        img: torrejon,
        desc: "Rebanadas de brioche artesanal doradas en mantequilla, rellenas de crema de ricotta al limón y acompañadas de compota casera de arándanos frescos. Dulce, ácido y perfectamente equilibrado.",
      },
    ],
  },
  {
    name: "Bebidas",
    items: [
      { name: "Bebida 1", price: "$0.00", img: null, desc: "Descripción próximamente." },
      { name: "Bebida 2", price: "$0.00", img: null, desc: "Descripción próximamente." },
      { name: "Bebida 3", price: "$0.00", img: null, desc: "Descripción próximamente." },
    ],
  },
  {
    name: "Postres",
    items: [
      { name: "Postre 1", price: "$0.00", img: null, desc: "Descripción próximamente." },
      { name: "Postre 2", price: "$0.00", img: null, desc: "Descripción próximamente." },
      { name: "Postre 3", price: "$0.00", img: null, desc: "Descripción próximamente." },
    ],
  },
];

const FlipCard = ({ item }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card${flipped ? " is-flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-pressed={flipped}
    >
      <div className="flip-inner">
        {/* ── Front ── */}
        <div className="flip-front">
          {item.img
            ? <img src={item.img} alt={item.name} className="flip-img" loading="lazy" />
            : <div className="flip-img-placeholder" />
          }
          <div className="flip-front-info">
            <span className="menu-item-name">{item.name}</span>
            <span className="menu-item-price">{item.price}</span>
          </div>
          <span className="flip-hint">Toca para ver más</span>
        </div>

        {/* ── Back ── */}
        <div className="flip-back">
          <p className="flip-back-label">✦</p>
          <h3 className="flip-back-name">{item.name}</h3>
          <p className="flip-back-price">{item.price}</p>
          <p className="flip-back-desc">{item.desc}</p>
          <span className="flip-back-close">Toca para cerrar</span>
        </div>
      </div>
    </div>
  );
};

const Menu = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".menu-hero-title", {
        y: 30, opacity: 0, duration: 0.55, ease: "power3.out",
      });
      gsap.from(".menu-hero-sub", {
        y: 18, opacity: 0, duration: 0.55, delay: 0.15, ease: "power3.out",
      });

      gsap.utils.toArray(".menu-category-title").forEach((title) => {
        gsap.from(title, {
          scrollTrigger: { trigger: title, start: "top 85%", once: true },
          x: -20, opacity: 0, duration: 0.4, ease: "power2.out",
        });
      });

      ScrollTrigger.batch(".flip-card", {
        onEnter: (batch) =>
          gsap.fromTo(batch,
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }
          ),
        start: "top 92%",
        once: true,
      });
    }, pageRef);

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    const onLoad = () => ScrollTrigger.refresh();
    globalThis.addEventListener("load", onLoad);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimer);
      globalThis.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div ref={pageRef}>
      <Navbar />

      <section className="menu-hero">
        <video className="menu-hero-video" autoPlay muted loop playsInline preload="metadata">
          <source src="https://res.cloudinary.com/dwhezsxkg/video/upload/v1778112262/menubrunch_xe5q9r.mp4" type="video/mp4" />
        </video>
        <div className="menu-hero-overlay">
          <h1 className="menu-hero-title">Nuestro Menú</h1>
          <p className="menu-hero-sub">Ingredientes frescos, sabores que enamoran</p>
        </div>
      </section>

      <section className="section has-background-white">
        <div className="container">
          {categories.map((cat) => (
            <div key={cat.name} className="menu-category">
              <h2 className="menu-category-title">{cat.name}</h2>
              <div className="divider" />
              <div className="columns is-multiline">
                {cat.items.map((item) => (
                  <div key={item.name} className="column is-4">
                    <FlipCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Menu;
