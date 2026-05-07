import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import "./Navbar.css";

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-animate", {
        y: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="navbar navbar-custom" role="navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item nav-animate brand-name">
          Brunch & Co.
        </Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-end">
          <Link to="/" className="navbar-item nav-link nav-animate">Inicio</Link>
          <Link to="/menu" className="navbar-item nav-link nav-animate">Menú</Link>
          <Link to="/about" className="navbar-item nav-link nav-animate">Nosotros</Link>
          <Link to="/contact" className="navbar-item nav-link nav-animate">Contacto</Link>
          <div className="navbar-item nav-animate">
            <Link to="/login">
              <button className="button reservar-btn">Reservar</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
