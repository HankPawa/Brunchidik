import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import englisheggs from "../assets/englisheggs.jpg";
import torrejon from "../assets/torrejon.jpg";
import baconeggs from "../assets/baconeggs.jpg";
import eggs from "../assets/eggs.jpg";
import "./Menu.css";

gsap.registerPlugin(ScrollTrigger);

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";

const categories = [
  {
    name: "Desayunos Clasicos",
    items: [
      { name: "Pancakes", price: "$12.900", img: pancakes, desc: "Una torre de cuatro pancakes dorados y extra esponjosos, bañados con un generoso hilo de miel de abejas pura y una fina lluvia de azúcar glass que evoca un paisaje nevado. Coronados con frambuesas frescas y rodeados de arándanos azules y láminas de almendra tostada para un contraste crujiente." },
      { name: "Bacon Eggs", price: "$18.900", img: baconeggs, desc: "Una combinación clásica y rústica preparada al momento en sartén de hierro. Incluye tiras de tocineta premium ahumada en madera de nogal, cocinadas hasta alcanzar el punto exacto de crocancia, acompañadas de un huevo frito cuya yema se mantiene sedosa para resaltar los sabores naturales y salados del conjunto. " },
      { name: "Muffin Inglés con Huevos Revueltos", price: "$21.000", img: englisheggs, desc: "Un muffin inglés artesanal de textura aireada, tostado ligeramente y servido con una porción generosa de huevos revueltos cremosos, sazonados con una pizca de pimienta negra molida. Acompañado de tomates cherry en rama, asados suavemente para resaltar su dulzor natural." },
    ],
  },
  {
    name: "Brunch",
    items: [
      { name: "Avocado Toast Campestre", price: "$30.000", img: avocado, desc: "Una generosa rebanada de pan artesanal de masa madre tostado, cubierta con una suave crema de aguacate y un salteado de vegetales frescos (maíz tierno, pimentón y cebollas caramelizadas). Terminado con una rama de romero fresco y pimienta negra recién molida para un aroma inigualable." },
      { name: "Eggs Benedict", price: "$29.900", img: eggs, desc: "Dos huevos pochados con yema líquida servidos sobre muffins ingleses tostados y jamón de espalda premium. Bañados en nuestra sedosa salsa holandesa de la casa con un toque de páprika, acompañados de una ensalada fresca de rúcula, tomates cherry y cebolla morada." },
      { name: "Torrijas rellenas de ricotta con arándanos y limón", price: "$0.00", img: torrejon, desc: "Gruesas rebanadas de pan brioche artesanal, sumergidas en una mezcla de leche infusionada con cítricos y luego doradas en mantequilla hasta obtener un exterior crujiente. Están generosamente rellenas de una crema suave de queso ricotta al limón y acompañadas de un compota casera de arándanos frescos que aporta un equilibrio perfecto entre lo dulce y lo ácido" },
    ],
  },
  {
    name: "Bebidas",
    items: [
      { name: "Bebida 1", price: "$0.00", img: null },
      { name: "Bebida 2", price: "$0.00", img: null },
      { name: "Bebida 3", price: "$0.00", img: null },
    ],
  },
  {
    name: "Postres",
    items: [
      { name: "Postre 1", price: "$0.00", img: null },
      { name: "Postre 2", price: "$0.00", img: null },
      { name: "Postre 3", price: "$0.00", img: null },
    ],
  },
];

const Menu = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".menu-hero-title", {
        y: 30,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      });

      gsap.from(".menu-hero-sub", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.utils.toArray(".menu-category-title").forEach((title) => {
        gsap.from(title, {
          scrollTrigger: { trigger: title, start: "top 85%", once: true },
          x: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      // Single batch listener instead of one ScrollTrigger per card
      ScrollTrigger.batch(".menu-card", {
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

      <section className="section">
        <div className="container">
          {categories.map((cat) => (
            <div key={cat.name} className="menu-category">
              <h2 className="menu-category-title">{cat.name}</h2>
              <div className="divider" />

              <div className="columns is-multiline">
                {cat.items.map((item) => (
                  <div key={item.name} className="column is-4">
                    <div className="menu-card">
                      {item.img
                        ? <img src={item.img} alt={item.name} className="menu-img" loading="lazy" />
                        : <div className="menu-img-placeholder" />
                      }
                      <div className="menu-card-body">
                        <div className="menu-card-header">
                          <span className="menu-item-name">{item.name}</span>
                          <span className="menu-item-price">{item.price}</span>
                        </div>
                        <p className="menu-item-desc">{item.desc ?? lorem}</p>
                      </div>
                    </div>
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
