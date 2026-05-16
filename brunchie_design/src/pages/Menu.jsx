import { useState, useEffect, useRef } from "react";
import SandwichFalling from "../components/SandwichFalling";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  "Pancakes":                          pancakes,
  "Bacon Eggs":                        baconeggs,
  "Muffin Inglés con Huevos":          englisheggs,
  "Avocado Toast Campestre":           avocado,
  "Eggs Benedict":                     eggs,
  "Torrijas de Ricotta":               torrejon,
  "Mimosa":                            mimosa_coctel,
  "Kombucha":                          kombucha,
  "Matcha Latte":                      matcha_latte,
  "French Toast":                      null,
  "Parfait de granola y frutos rojos": null,
  "Açaí Bowl":                         null,
};

const fmtPrecio = (precio) => `$${Number(precio).toLocaleString("es-CO")}`;

const PAGE_SIZE = 3;

/* ── FlipCard ── */
const FlipCard = ({ item, onOpenModal }) => {
  const [flipped, setFlipped]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const img = imageMap[item.nombre] || item.imagenUrl || null;

  return (
    <div
      className={`flip-card${flipped ? " is-flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-pressed={flipped}
    >
      <div className="flip-inner">
        <div className="flip-front">
          {img ? (
            <div className="flip-img-wrap">
              {!imgLoaded && <div className="flip-img-skeleton" />}
              <img
                src={img}
                alt={item.nombre}
                className={`flip-img${imgLoaded ? " flip-img--loaded" : ""}`}
                loading="lazy"
                decoding="async"
                width="100%"
                height="240"
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          ) : (
            <div className="flip-img-placeholder" />
          )}
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
              onOpenModal({ id: item.id, name: item.nombre, price: fmtPrecio(item.precio), img, desc: item.descripcion, priceNum: Number(item.precio) });
            }}
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Catálogo completo (modal) ── */
const CatalogoModal = ({ categoria, onClose, onOpenModal }) => {
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(cardRef.current,    { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  return (
    <div className="catalogo-overlay" ref={overlayRef} onClick={handleClose}>
      <div className="catalogo-modal" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <div className="catalogo-header">
          <h2 className="catalogo-title">{categoria.nombre}</h2>
          <button className="catalogo-close" onClick={handleClose}><X size={20} /></button>
        </div>
        <div className="catalogo-grid">
          {(categoria.items || []).map((item) => (
            <FlipCard key={item.id} item={item} onOpenModal={(i) => { onClose(); onOpenModal(i); }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Slider por categoría ── */
const CategorySlider = ({ categoria, onOpenModal }) => {
  const items      = categoria.items || [];
  const [page, setPage]             = useState(0);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const trackRef   = useRef(null);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const hasSlider  = items.length > PAGE_SIZE;
  const visible    = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const animateSlide = () => {
    if (!trackRef.current) return;
    gsap.fromTo(
      trackRef.current.querySelectorAll(".cat-slider-item"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" }
    );
  };

  const goTo = (newPage) => {
    setPage(newPage);
    setTimeout(animateSlide, 10);
  };

  return (
    <>
      <div className="cat-slider">
        <div className="cat-slider-track" ref={trackRef}>
          {visible.map((item) => (
            <div key={item.id} className="cat-slider-item">
              <FlipCard item={item} onOpenModal={onOpenModal} />
            </div>
          ))}
        </div>

        <div className="cat-slider-footer">
          {hasSlider && (
            <div className="cat-slider-nav">
              <button className="cat-slider-arrow" onClick={() => goTo(page - 1)} disabled={page === 0}>
                <ChevronLeft size={20} />
              </button>
              <span className="cat-slider-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <span key={i} className={`cat-slider-dot${i === page ? " active" : ""}`} onClick={() => goTo(i)} />
                ))}
              </span>
              <button className="cat-slider-arrow" onClick={() => goTo(page + 1)} disabled={page === totalPages - 1}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          {items.length > PAGE_SIZE && (
            <button className="cat-ver-todo" onClick={() => setCatalogoOpen(true)}>
              Ver todo ({items.length})
            </button>
          )}
        </div>
      </div>

      {catalogoOpen && (
        <CatalogoModal
          categoria={categoria}
          onClose={() => setCatalogoOpen(false)}
          onOpenModal={onOpenModal}
        />
      )}
    </>
  );
};

/* ── Página principal ── */
const Menu = () => {
  const pageRef   = useRef(null);
  const [modalItem, setModalItem] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]     = useState(true);

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".menu-hero-title", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".menu-hero-sub",   { y: 18, opacity: 0, duration: 0.6, delay: 0.15, ease: "power3.out" });

      gsap.utils.toArray(".menu-category").forEach((cat) => {
        gsap.from(cat.querySelector(".menu-category-title"), {
          scrollTrigger: { trigger: cat, start: "top 85%", once: true },
          x: -24, opacity: 0, duration: 0.4, ease: "power2.out",
        });
        gsap.from(cat.querySelectorAll(".cat-slider-item"), {
          scrollTrigger: { trigger: cat, start: "top 80%", once: true },
          opacity: 0, y: 30, duration: 0.45, stagger: 0.1, ease: "power2.out",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, categorias]);

  return (
    <div ref={pageRef}>
      <SandwichFalling />
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
                <CategorySlider categoria={cat} onOpenModal={setModalItem} />
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
