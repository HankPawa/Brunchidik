import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, LayoutDashboard } from "lucide-react";
import gsap from "gsap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navRef = useRef(null);
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-animate", {
        y: -20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
      });
    }, navRef);
    return () => ctx.revert();
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
        <Link to="/" className="navbar-item nav-animate brand-name">Brunch & Co.</Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-end">
          <Link to="/" className="navbar-item nav-link nav-animate">Inicio</Link>
          <Link to="/menu" className="navbar-item nav-link nav-animate">Menú</Link>
          <Link to="/about" className="navbar-item nav-link nav-animate">Nosotros</Link>
          <Link to="/contact" className="navbar-item nav-link nav-animate">Contacto</Link>

          <div className="navbar-item nav-animate">
            <button className="cart-icon-btn" onClick={() => setIsOpen(true)}>
              <ShoppingBag size={20} strokeWidth={1.8} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
          </div>

          <div className="navbar-item nav-animate">
            <Link to={user ? "/reservas" : "/login"}>
              <button className="button reservar-btn">Reservar</button>
            </Link>
          </div>

          {user?.rol === "ADMIN" && (
            <div className="navbar-item nav-animate">
              <Link to="/admin" className="admin-nav-btn" title="Panel admin">
                <LayoutDashboard size={18} strokeWidth={1.8} />
              </Link>
            </div>
          )}

          {user && (
            <div className="navbar-item nav-animate nav-user-wrap">
              <Link to="/perfil" className="nav-user-btn">
                <span className="nav-user-avatar">{initiales}</span>
                <span className="nav-user-name">{user.nombre.split(" ")[0]}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
