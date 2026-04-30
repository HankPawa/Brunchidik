import { useEffect, useRef } from "react";
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
    const ctx = gsap.context(() => {
      gsap.from(".fav-title", {
        scrollTrigger: {
          trigger: ".fav-title",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.from(".fav-card", {
        scrollTrigger: {
          trigger: ".fav-card",
          start: "top 90%",
        },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out",
      });

      gsap.from(".fav-btn", {
        scrollTrigger: {
          trigger: ".fav-btn",
          start: "top 95%",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section has-background-light">
      <div className="container has-text-centered">
        <h2 className="title is-4 fav-title">Nuestros Favoritos</h2>

        <div className="columns is-centered mt-5">
          {items.map((item, i) => (
            <div className="column is-3" key={i}>
              <div className="card custom-card fav-card">
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={item.img} alt={item.name} />
                  </figure>
                </div>
                <div className="card-content">
                  <p>{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="button is-black is-small mt-4 fav-btn">
          Ver menú completo
        </button>
      </div>
    </section>
  );
};

export default Favorites;