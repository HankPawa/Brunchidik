import "./Footer.css";
import instagram from "../assets/instagram.png";
import facebook from "../assets/facebook.png";
import tiktok from "../assets/tiktok.png";

const Footer = () => {
  return (
    <footer className="footer custom-footer">
      <div className="container">

        <div>
            <h3 className="footer-slogan">Ven a visitarnos</h3>
            <p className="footer-subtitle">Abierto todos los días. Reservas disponibles para grupos.</p>
        </div>
        
        <div className="social-top">
            <img src={instagram} alt="Instagram" />
            <img src={facebook} alt="Facebook" />
            <img src={tiktok} alt="TikTok" />
        </div>

        <div className="columns is-mobile is-multiline">


          <div className="column is-4">
            <p className="footer-title">Brunch & Co.</p>
            <p className="footer-text">El mejor brunch de la ciudad</p>
          </div>

          <div className="column is-4">
            <p className="footer-title">Contacto</p>
            <p className="footer-text">📍 Calle 123</p>
            <p className="footer-text">📞 +57 000 000</p>
          </div>

            <div className="column is-4">
                <p className="footer-title">Horarios</p>
                <p className="footer-text">L - V: 8:00 - 18:00</p>
                <p className="footer-text">S - D: 9:00 - 17:00</p>
            </div>

        </div>

        <div className="footer-bottom has-text-centered">
          <p>© 2026 Brunch & Co.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

