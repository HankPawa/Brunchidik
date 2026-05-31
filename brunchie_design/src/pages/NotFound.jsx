import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./NotFound.css";

const NotFound = () => {
  useEffect(() => { document.title = "Página no encontrada | Brunch & Co."; }, []);

  return (
    <>
      <Navbar />
      <main className="notfound-main">
        <div className="notfound-content">
          <span className="notfound-bg-code">404</span>
          <div className="notfound-gem">✦</div>
          <h1 className="notfound-title">Página no encontrada</h1>
          <p className="notfound-sub">La página que buscas no existe o fue movida a otro lugar.</p>
          <Link to="/" className="notfound-btn">Volver al inicio</Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
