import "./Footer.css";
import SocialLinks from "./SocialLinks";

const Footer = () => {
  return (
    <footer className="footer custom-footer">
      <div className="footer-inner">

        <div className="footer-top">
          <h3 className="footer-slogan">Ven a visitarnos</h3>
          <p className="footer-subtitle">Abierto todos los días. Reservas disponibles para grupos.</p>
          <SocialLinks color="#ffffff" size={20} />
        </div>

        <div className="footer-sep" />

        <div className="footer-cols">
          <div className="footer-col">
            <p className="footer-title">Brunch & Co.</p>
            <p className="footer-text">El mejor brunch de la ciudad</p>
          </div>

          <div className="footer-col">
            <p className="footer-title">Contacto</p>
            <p className="footer-text">Calle 123</p>
            <p className="footer-text">+57 000 000</p>
          </div>

          <div className="footer-col">
            <p className="footer-title">Horarios</p>
            <p className="footer-text">Lun – Vie: 8:00 – 17:00</p>
            <p className="footer-text">Sábado: 9:00 – 16:00</p>
            <p className="footer-text">Domingo: Cerrado</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Brunch & Co.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
