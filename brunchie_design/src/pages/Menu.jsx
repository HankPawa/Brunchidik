import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductModal from "../components/ProductModal";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import englisheggs from "../assets/englisheggs.jpg";
import torrejon from "../assets/torrejon.jpg";
import baconeggs from "../assets/baconeggs.webp";
import eggs from "../assets/eggs.jpg";
import matcha_latte from "../assets/matcha_latte.jpg";
import mimosa_coctel from "../assets/mimosa_coctel.jpg";
import kombucha from "../assets/kombucha.jpg";
import "./Menu.css";

gsap.registerPlugin(ScrollTrigger);

const imageMap = {
  "Pancakes":                 pancakes,
  "Bacon Eggs":               baconeggs,
  "Muffin Inglés con Huevos": englisheggs,
  "Avocado Toast Campestre":  avocado,
  "Eggs Benedict":            eggs,
  "Torrijas de Ricotta":      torrejon,
  "Mimosa":                   mimosa_coctel,
  "Kombucha":                 kombucha,
  "Matcha Latte":             matcha_latte,
};

const fmtPrecio = (precio) => `$${Number(precio).toLocaleString("es-CO")}`;

const PAGE_SIZE = 3;

const FlipCard = ({ item, onOpenModal }) => {
  const [flipped, setFlipped] = useState(false);
  const img = imageMap[item.nombre] || null;

  return (
    <div
      className={`flip-card${flipped ? " is-flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-pressed={flipped}
    >
      <div className="flip-inner">
        <div className="flip-front">
          {img
            ? <img src={img} alt={item.nombre} className="flip-img" loading="lazy" />
            : <div className="flip-img-placeholder" />
          }
          <div className="flip-front-info">
            <span className="menu-item-name">{item.nombre}</span>
            <span className="menu-item-price">{fmtPrecio(item.precio)}</span>
          </div>
          <span className="flip-hint">Toca para ver más</span>
        </div>
        <div className="flip-back">
          <p className="flip-back-label">✦</p>
          <h3 className="flip-back-name">{item.nombre}</h3>
          <p className="flip-back-price">{fmtPrecio(item.precio)}</p>
          <p className="flip-back-desc">{item.descripcion}</p>
          <button
            className="flip-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal({
                id:       item.id,
                name:     item.nombre,
                price:    fmtPrecio(item.precio),
                img,
                desc:     item.descripcion,
                priceNum: Number(item.precio),
              });
            }}
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

const CategorySlider = ({ items, onOpenModal }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const hasSlider = items.length > PAGE_SIZE;
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="cat-slider">
      <div className="cat-slider-track">
        {visible.map((item) => (
          <div key={item.id} className="cat-slider-item">
            <FlipCard item={item} onOpenModal={onOpenModal} />
          </div>
        ))}
      </div>

      {hasSlider && (
        <div className="cat-slider-nav">
          <button
            className="cat-slider-arrow"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            <ChevronLeft size={20} />
          </button>

          <span className="cat-slider-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`cat-slider-dot ${i === page ? "active" : ""}`}
                onClick={() => setPage(i)}
              />
            ))}
          </span>

          <button
            className="cat-slider-arrow"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const Menu = () => {
  const pageRef = useRef(null);
  const [modalItem, setModalItem] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || categorias.length === 0) return;
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".menu-hero-title", { y: 30, opacity: 0, duration: 0.55, ease: "power3.out" });
      gsap.from(".menu-hero-sub",   { y: 18, opacity: 0, duration: 0.55, delay: 0.15, ease: "power3.out" });
      gsap.utils.toArray(".menu-category-title").forEach((title) => {
        gsap.from(title, {
          scrollTrigger: { trigger: title, start: "top 85%", once: true },
          x: -20, opacity: 0, duration: 0.4, ease: "power2.out",
        });
      });
    }, pageRef);

    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    const onLoad = () => ScrollTrigger.refresh();
    globalThis.addEventListener("load", onLoad);
    return () => { ctx.revert(); clearTimeout(t); globalThis.removeEventListener("load", onLoad); };
  }, [loading, categorias]);

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
          {loading ? (
            <p className="menu-loading">Cargando menú...</p>
          ) : (
            categorias.map((cat) => (
              <div key={cat.id} className="menu-category">
                <h2 className="menu-category-title">{cat.nombre}</h2>
                <div className="divider" />
                <CategorySlider items={cat.items || []} onOpenModal={setModalItem} />
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
      <ProductModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
};

export default Menu;
