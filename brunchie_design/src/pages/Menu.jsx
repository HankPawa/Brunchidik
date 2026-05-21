import { useState, useEffect, useRef } from "react";
import SandwichFalling from "../components/SandwichFalling";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import englisheggs from "../assets/englisheggs.jpg";
import torrejon from "../assets/torrejon.jpg";
import baconeggs from "../assets/baconeggs.webp";
import eggs from "../assets/eggs.jpg";
import matcha_latte from "../assets/matcha_latte.jpg";
import mimosa_coctel from "../assets/mimosa_coctel.jpg";
import kombucha from "../assets/kombucha.jpg";
import french_toast from "../assets/french_toast.jpg";
import parfait from "../assets/parfait.jpg";
import acai_bowl from "../assets/acai_bowl.jpg";
import "./Menu.css";
import WeatherRecommendation from "../components/WeatherRecommendation";

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
      {
        name: "Huevos Revueltos Cremosos",
        price: "$15.900",
        img: eggs,
        desc: "Huevos revueltos de corral sazonados con pimienta negra molida y hierbas frescas. Acompañados de tostadas integrales caseras, aguacate fresco y tomates cherry cherry maduros.",
      },
      {
        name: "Pancakes con Frutos Rojos",
        price: "$14.500",
        img: pancakes,
        desc: "Torre de tres pancakes esponjosos coronados con una generosa porción de frutos rojos frescos, crema batida y un toque de miel de flores silvestres.",
      },
      {
        name: "Huevos al Nido",
        price: "$19.000",
        img: baconeggs,
        desc: "Base de papas caseras crujientes con un nido de cebolla caramelizada, coronado con dos huevos, tocineta ahumada y champiñones salteados.",
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
      {
        name: "Avocado Toast con Salmón",
        price: "$34.900",
        img: avocado,
        desc: "Pan de masa madre tostado con crema de aguacate, salmón ahumado premium, cebolla morada encurtida y un huevo pochado. Acompañado con microgreens y semillas de sésamo.",
      },
      {
        name: "French Toast Gourmet",
        price: "$27.500",
        img: french_toast,
        desc: "Rebanadas de pan brioche cubiertas con una mezcla de huevo y especias, cocinadas hasta dorar. Servidas con jarabe de arce puro, frutos rojos frescos y crema batida artesanal.",
      },
      {
        name: "Huevos Benedictus Premium",
        price: "$32.000",
        img: eggs,
        desc: "Versión premium de nuestro Eggs Benedict: dos huevos pochados, jamón ibérico, salsa holandesa casera con toque de trufa y espárragos frescos al vapor.",
      },
    ],
  },
  {
    name: "Bebidas",
    items: [
      { name: "Mimosa", price: "$16.000", img: mimosa_coctel, desc: "Burbujas de champaña encontrándose con el sol de un jugo de naranja recién exprimido. Fresca, festiva y elegante, la Mimosa es el brindis perfecto para empezar la mañana con estilo. Un clásico que nunca pasa de moda." },
      { name: "Kombucha", price: "$10.000", img: kombucha, desc: "Una bebida fermentada de té con siglos de historia y personalidad propia. Ligeramente efervescente, con notas frutales y un toque ácido que despierta los sentidos. Cuida tu bienestar sin sacrificar el sabor — porque sentirse bien también puede ser delicioso." },
      { name: "Matcha Latte", price: "$12.000", img: matcha_latte, desc: "Polvo de té verde japonés de primera calidad, suavemente disuelto en leche vaporizada hasta crear una bebida aterciopelada, cremosa y de un verde que enamora. Energía limpia y sostenida, sin los altibajos del café. La elección de quienes saben disfrutar despacio." },
      { name: "Mimosa Clásica", price: "$16.000", img: mimosa_coctel, desc: "Bebida refrescante hecha con champagne premium y jugo de naranja recién exprimido. Perfecta para celebrar y disfrutar en cualquier momento del brunch." },
      { name: "Té Verde Matcha Frio", price: "$11.000", img: matcha_latte, desc: "Té matcha preparado en frío, suave y cremoso con un toque de hielo. Bebida refrescante que mantiene todos los beneficios del matcha con un sabor perfecto para días cálidos." },
      { name: "Kombucha Tropical", price: "$11.500", img: kombucha, desc: "Kombucha artesanal con sabores tropicales de mango y coco. Efervescente, refrescante y llena de probióticos naturales para tu bienestar." },
    ],
  },
  {
    name: "Postres",
    items: [
      { name: "French Toast", price: "$18.900", img: french_toast, desc: "Brioche tostado bañado en mezcla de huevo y especias, cocinado hasta dorar. Acompañado de sirope de arce, frutos silvestres frescos y crema batida casera." },
      { name: "Parfait de granola y frutos rojos", price: "$14.500", img: parfait, desc: "Capas de yogur griego cremoso, granola casera crujiente, miel pura y frutos rojos frescos. Una combinación perfecta de texturas y sabores en cada cucharada." },
      { name: "Açaí bowl", price: "$15.000", img: acai_bowl, desc: "Base de açaí puro congelado batido hasta crear una textura cremosa, coronada con granola artesanal, coco rallado, frutos frescos y miel de abejas." },
      { name: "Waffle Belga", price: "$17.500", img: french_toast, desc: "Waffle crujiente por fuera y suave por dentro, cubierto con chocolate derretido, frutos rojos frescos, crema batida y nueces caramelizadas." },
      { name: "Tiramisú Clásico", price: "$12.900", img: parfait, desc: "Postre italiano tradicional con capas de bizcocho humedecido en café espresso, mascarpone cremoso y un toque de cacao en polvo. Elegancia en cada bocado." },
      { name: "Cheesecake de Frutos Rojos", price: "$13.500", img: acai_bowl, desc: "Base de galleta casera crujiente, relleno de queso crema suave y ligero, coronado con compota casera de frutos rojos frescos. Perfecto final para tu brunch." },
    ],
  },
];

const FlipCard = ({ item }) => {
  const [flipped, setFlipped]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart } = useCart();

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
          {item.img ? (
            <div className="flip-img-wrap">
              {!imgLoaded && <div className="flip-img-skeleton" />}
              <img
                src={item.img}
                alt={item.name}
                className={`flip-img${imgLoaded ? " flip-img--loaded" : ""}`}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          ) : (
            <div className="flip-img-placeholder" />
          )}
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
          <button
            className="flip-add-btn"
            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
          >
            + Agregar al carrito
          </button>
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
      <SandwichFalling heroSelector=".menu-hero" rightOffset={4} />
      <Navbar />

      <section className="menu-hero">
        <video className="menu-hero-video" autoPlay muted loop playsInline preload="metadata">
          <source src="https://res.cloudinary.com/dwhezsxkg/video/upload/v1778112262/menubrunch_xe5q9r.mp4" type="video/mp4" />
        </video>
        <div className="menu-hero-overlay">
          <div className="menu-hero-texts">
            <h1 className="menu-hero-title">Nuestro Menú</h1>
            <p className="menu-hero-sub">Ingredientes frescos, sabores que enamoran</p>
          </div>
          <WeatherRecommendation />
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
