import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, LayoutDashboard, Sun, Moon } from "lucide-react";
import gsap from "gsap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import "./Navbar.css";

const Navbar = () => {
  const navRef = useRef(null);
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const yaAnimado = sessionStorage.getItem("nav_animated");
    const ctx = gsap.context(() => {
      if (!yaAnimado) {
        gsap.from(".nav-animate", {
          y: -20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
          onComplete: () => sessionStorage.setItem("nav_animated", "1"),
        });
      } else {
        gsap.set(".nav-animate", { y: 0, opacity: 1 });
      }
    }, navRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initiales = user?.nombre
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav ref={navRef} className="navbar navbar-custom" role="navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item nav-animate brand-name" onClick={closeMenu}>Brunch & Co.</Link>

        <button
          className={`nav-burger${menuOpen ? " is-active" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="menú"
          aria-expanded={menuOpen}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div className={`navbar-menu${menuOpen ? " is-active" : ""}`}>
        <div className="navbar-end">
          <Link to="/" className="navbar-item nav-link nav-animate" onClick={closeMenu}>Inicio</Link>
          <Link to="/menu" className="navbar-item nav-link nav-animate" onClick={closeMenu}>Menú</Link>
          <Link to="/about" className="navbar-item nav-link nav-animate" onClick={closeMenu}>Nosotros</Link>
          <Link to="/contact" className="navbar-item nav-link nav-animate" onClick={closeMenu}>Contacto</Link>
          <Link to="/suscripcion" className="navbar-item nav-link nav-animate" onClick={closeMenu}>Premium</Link>

          <div className="navbar-item nav-animate">
            <button className="dark-toggle-btn" onClick={toggleDark} title={dark ? "Modo claro" : "Modo oscuro"} aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}>
              {dark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </button>
          </div>

          <div className="navbar-item nav-animate">
            <button className="cart-icon-btn" onClick={() => { setIsOpen(true); closeMenu(); }}>
              <ShoppingBag size={20} strokeWidth={1.8} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
          </div>

          {user ? (
            <div className="navbar-item nav-animate">
              <Link to="/reservas" onClick={closeMenu}>
                <button className="button reservar-btn">Reservar</button>
              </Link>
            </div>
          ) : (
            <div className="navbar-item nav-animate">
              <Link to="/login" onClick={closeMenu}>
                <button className="button reservar-btn">Iniciar sesión</button>
              </Link>
            </div>
          )}

          {user?.rol === "ADMIN" && (
            <div className="navbar-item nav-animate">
              <Link to="/admin" className="admin-nav-btn" title="Panel admin" onClick={closeMenu}>
                <LayoutDashboard size={18} strokeWidth={1.8} />
              </Link>
            </div>
          )}

          {user && (
            <div className="navbar-item nav-animate nav-user-wrap">
              <Link to="/perfil" className="nav-user-btn" onClick={closeMenu}>
                <span className="nav-user-avatar">{initiales}</span>
                <span className="nav-user-name">{user.nombre.split(" ")[0]}</span>
                {user.suscrito && <span className="nav-premium-badge" title="Usuario Premium">✦</span>}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
