import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import eggs from "../assets/eggs.jpg";
import "./Favorites.css";

gsap.registerPlugin(ScrollTrigger);

const Favorites = () => {
  const sectionRef  = useRef(null);
  const tweenRef    = useRef(null);
  const [selected, setSelected] = useState(null);

  const items = [
    {
      name: "Pancakes",
      img: pancakes,
      desc: "Torre de pancakes dorados con miel de abejas, azúcar glass y frutos rojos frescos.",
    },
    {
      name: "Avocado Toast",
      img: avocado,
      desc: "Pan artesanal tostado con aguacate cremoso, semillas de sésamo y un toque de limón.",
    },
    {
      name: "Eggs Benedict",
      img: eggs,
      desc: "Muffin inglés con jamón, huevo pochado y salsa holandesa hecha al momento.",
    },
    {
      name: "Pancakes",
      img: pancakes,
      desc: "Torre de pancakes dorados con miel de abejas, azúcar glass y frutos rojos frescos.",
    },
    {
      name: "Avocado Toast",
      img: avocado,
      desc: "Pan artesanal tostado con aguacate cremoso, semillas de sésamo y un toque de limón.",
    },
    {
      name: "Eggs Benedict",
      img: eggs,
      desc: "Muffin inglés con jamón, huevo pochado y salsa holandesa hecha al momento.",
    },
  ];

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {

      gsap.from(".fav-title", {
        scrollTrigger: { trigger: ".fav-title", start: "top 85%", once: true },
        y: 25,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
      });

      gsap.from(".fav-btn", {
        scrollTrigger: { trigger: ".fav-btn", start: "top 95%", once: true },
        y: 15,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });

      const cards = gsap.utils.toArray(".fav-card");
      const total = cards.length;
      const angle = 360 / total;
      const radius = 250;

      cards.forEach((card, i) => {
        gsap.set(card, {
          rotationY: i * angle,
          transformOrigin: `50% 50% -${radius}px`,
          z: radius,
        });
      });

      const tween = gsap.to(".carousel", {
        rotationY: "+=360",
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      tweenRef.current = tween;

      const carousel = document.querySelector(".carousel");
      carousel.addEventListener("mouseenter", () => tween.pause());
      carousel.addEventListener("mouseleave", () => tween.resume());

    }, sectionRef);

    const onLoad = () => ScrollTrigger.refresh();
    globalThis.addEventListener("load", onLoad);

    return () => {
      ctx.revert();
      globalThis.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <section ref={sectionRef} className="section has-background-light fav-section">
      <div className="container has-text-centered">

        <h2 className="title is-4 fav-title">Nuestros Favoritos</h2>

        <div className="carousel-container fav-carousel-wrap">
          <div className="carousel">
            {items.map((item, index) => (
              <div
                className={`fav-card card custom-card ${selected?.name === item.name ? "fav-card--active" : ""}`}
                key={index}
                onClick={() => {
                  const isSame = selected?.name === item.name;
                  setSelected(isSame ? null : item);
                  if (isSame) tweenRef.current?.resume();
                  else tweenRef.current?.pause();
                }}
              >
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={item.img} alt={item.name} loading="lazy"/>
                  </figure>
                </div>
                <div className="card-content">
                  <p className="fav-card-name">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="fav-desc-panel">
            <button className="fav-desc-close" onClick={() => { setSelected(null); tweenRef.current?.resume(); }}>✕</button>
            <p className="fav-desc-name">{selected.name}</p>
            <p className="fav-desc-text">{selected.desc}</p>
          </div>
        )}

        <Link to="/menu" className="button is-black is-small fav-btn">
          Ver menú completo
        </Link>

      </div>
    </section>
  );
};

export default Favorites;