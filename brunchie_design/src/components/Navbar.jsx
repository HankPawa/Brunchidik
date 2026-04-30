import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar is-light px-5">
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