import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import eggs from "../assets/eggs.jpg";
import "./Favorites.css";

gsap.registerPlugin(ScrollTrigger);

const Favorites = () => {
  const sectionRef = useRef(null);

  const items = [
    { name: "Pancakes", img: pancakes },
    { name: "Avocado Toast", img: avocado },
    { name: "Eggs Benedict", img: eggs },
    { name: "Pancakes", img: pancakes },
    { name: "Avocado Toast", img: avocado },
    { name: "Eggs Benedict", img: eggs },
  ];

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {

      // ✨ Animaciones de entrada
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

      // 🔥 CARRUSEL 3D (tipo cilindro)
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

      // 🔄 ROTACIÓN CONTINUA
      const tween = gsap.to(".carousel", {
        rotationY: "+=360",
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      // ⏸ pausa al hover
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
    <section ref={sectionRef} className="section has-background-light">
      <div className="container has-text-centered">
        
        <h2 className="title is-4 fav-title">Nuestros Favoritos</h2>

        {/* 🔥 CARRUSEL 3D */}
        <div className="carousel-container mt-5">
          <div className="carousel">
            {items.map((item, index) => (
              <div className="fav-card card custom-card" key={index}>
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={item.img} alt={item.name} />
                  </figure>
                </div>
                <div className="card-content">
                  <p>{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/menu" className="button is-black is-small mt-5 fav-btn">
          Ver menú completo
        </Link>

      </div>
    </section>
  );
};

export default Favorites;