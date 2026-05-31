import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SocialLinks from "../components/SocialLinks";
import Form from "../components/Form";
import "./ContactUs.css";

const ContactUs = () => {
  useEffect(() => { document.title = "Contacto | Brunch & Co."; }, []);
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
          preload="metadata"
        >
          <source
            src="https://res.cloudinary.com/dwhezsxkg/video/upload/v1778112262/menubrunch_xe5q9r.mp4"
            type="video/mp4"
          />
        </video>
        <div className="menu-hero-overlay">
          <h1 className="contact-hero-title">Contáctanos</h1>
          <p className="menu-hero-sub">En Brunch & Co. somos una familia unida dispuesta a ayudarte</p>
        </div>
      </section>

      <main className="contact-main">
        <div className="contact-wrapper">

          <section className="contact-card contact-info">
            <span className="contact-eyebrow">Encuéntranos</span>
            <h2 className="contact-heading">Visítanos o escríbenos</h2>
            <p className="contact-body">
              En Brunch & Co. te esperamos con desayunos y brunch preparados con
              ingredientes frescos y sabor casero. Ven a relajarte en un ambiente
              acogedor y disfruta de nuestras especialidades.
            </p>

            <ul className="contact-list">
              <li>
                <strong>Horario:</strong>
                <span>Lun – Vie: 8:00 – 17:00</span>
              </li>
              <li>
                <strong>Sábado:</strong>
                <span>9:00 – 16:00</span>
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

            <p className="contact-social-label">Síguenos</p>
            <SocialLinks color="#2e2622" size={22} className="contact-social" />
          </section>

          <section className="contact-card contact-form">
            <span className="contact-eyebrow">Escríbenos</span>
            <h2 className="contact-heading">Tu opinión es importante</h2>
            <Form />
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContactUs;
