    const Footer = () => {
  return (
    <footer className="footer has-background-black has-text-white">
      <div className="content has-text-centered">
        <h3 className="has-text-white">Ven a visitarnos</h3>
        <p>Abierto todos los días. Reservas disponibles para grupos.</p>

        <button className="button is-light mt-3">Contactar</button>

        

        <div className="columns">
          <div className="column">
            <p><strong className="has-text-white">Brunch & Co.</strong></p>
            <p>El mejor brunch de la ciudad</p>
          </div>

          <div className="column">
            <p><strong className="has-text-white">Contacto</strong></p>
            <p>📍 Calle 123</p>
            <p>📞 +57 000 000</p>
          </div>

          <div className="column">
            <p><strong className="has-text-white">Horarios</strong></p>
            <p>Lunes - Viernes: 8:00 - 18:00</p>
            <p>Sábado - Domingo: 9:00 - 17:00</p>
          </div>
        </div>
      </div>
      <hr />
            <div className="column">
             <p>© 2026 Brunch & Co. Todos los derechos reservados.</p>
            </div>
    </footer>
  );
};

export default Footer;