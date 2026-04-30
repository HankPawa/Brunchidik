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

      ScrollTrigger.batch(".fav-card", {
        onEnter: (batch) =>
          gsap.fromTo(batch,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
          ),
        start: "top 92%",
        once: true,
      });

      gsap.from(".fav-btn", {
        scrollTrigger: { trigger: ".fav-btn", start: "top 95%", once: true },
        y: 15,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
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

        <div className="columns is-centered mt-5">
          {items.map((item) => (
            <div className="column is-3" key={item.name}>
              <div className="card custom-card fav-card">
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={item.img} alt={item.name} loading="lazy" />
                  </figure>
                </div>
                <div className="card-content">
                  <p>{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/menu" className="button is-black is-small mt-4 fav-btn">
          Ver menú completo
        </Link>
      </div>
    </section>
  );
};

export default Favorites;