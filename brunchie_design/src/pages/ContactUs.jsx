import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ContactUs.css";
import Form from "../components/Form";
import instagram from "../assets/instagram.png";
import facebook from "../assets/facebook.png";
import tiktok from "../assets/tiktok.png";

const ContactUs = () => {
  return (
    <>
      <Navbar />
          <section className="menu-hero">
        <video
            className="menu-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata">
          <source src="https://res.cloudinary.com/dwhezsxkg/video/upload/v1778112262/menubrunch_xe5q9r.mp4" type="video/mp4" />
        </video>
        <div className="menu-hero-overlay">
          <h1 className="menu-hero-title">Contactanos</h1>
          <p className="menu-hero-sub">En Brunc&Co. somos una familia unida dispuesta a ayudarte</p>
        </div>
      </section>

        <main className="contact-main">
        <div className="contact-wrapper">
          <section className="contact-card contact-info">
            <span>Contacto</span>
            <h2>Visítanos o escríbenos</h2>
            <p>
              En Brunch & Co. te esperamos con desayunos y almuerzos preparados
              con ingredientes frescos y sabor casero. Ven a relajarte en un
              ambiente acogedor y disfruta de nuestras especialidades.
            </p>

            <ul className="contact-list">
              <li>
                <strong>Horario:</strong>
                <span>Lun - Vie: 8:00 - 15:00</span>
              </li>
              <li>
                <strong>Sábado:</strong>
                <span>9:00 - 16:00</span>
              </li>
              <li>
                <strong>Domingo:</strong>
                <span>Cerrado</span>
              </li>
              <li>
                <strong>Dirección:</strong>
                <span>Calle del Sabor 123, Ciudad del Brunch</span>
              </li>
            </ul>

            <h3>Redes sociales</h3>
         <div className="social-top">
             <img src={instagram} alt="Instagram" />
             <img src={facebook} alt="Facebook" />
             <img src={tiktok} alt="TikTok" />
         </div>
          </section>

          <section className="contact-card contact-form">
            <span>Escríbenos</span>
            <h2>Tu opinión es importante</h2>
            <Form />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContactUs;
