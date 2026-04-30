import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Navbar.css";

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".navbar-item, .custom-btn", {
        y: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="navbar is-light px-5">
      <div className="navbar-brand">
        <a className="navbar-item">
          <strong>Brunch & Co.</strong>
        </a>
      </div>

      <div className="navbar-end">
        <a className="navbar-item">Inicio</a>
        <a className="navbar-item">Menú</a>
        <a className="navbar-item">Nosotros</a>
        <a className="navbar-item">Contacto</a>
        <button className="button is-black is-small custom-btn">
            Reservar
        </button>
      </div>
    </nav>
  );
};

export default Navbar;