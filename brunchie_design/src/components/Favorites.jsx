import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal";
import { fotoDePlato } from "../lib/fotosPlatos";
import "./Favorites.css";

// Los que más se piden van primero. Si alguno se agota o sale de la carta, su
// lugar lo ocupa otro plato disponible con foto: la portada nunca ofrece algo
// que no se puede pedir.
const PREFERIDOS = [
  "Eggs Benedict",
  "Pancakes",
  "Avocado Toast Campestre",
  "Torrijas de Ricotta",
  "Mimosa",
  "Matcha Latte",
];
const CUANTOS = 6;

const fmtPrecio = (precio) => `$${Number(precio).toLocaleString("es-CO")}`;

const prioridad = (plato) => {
  const i = PREFERIDOS.indexOf(plato.nombre);
  return i === -1 ? PREFERIDOS.length : i;
};

const Favorites = () => {
  const [platos, setPlatos] = useState(null); // null mientras carga
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    let vigente = true;
    fetch("/api/menu")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Error ${r.status}`))))
      .then((menu) => {
        const elegidos = menu
          .filter((p) => p.disponible && fotoDePlato(p))
          .sort((a, b) => prioridad(a) - prioridad(b))
          .slice(0, CUANTOS);
        if (vigente) setPlatos(elegidos);
      })
      .catch(() => vigente && setPlatos([]));
    return () => {
      vigente = false;
    };
  }, []);

  // Sin carta no hay nada que destacar; el menú sigue a un clic en la barra.
  if (platos?.length === 0) return null;

  return (
    <section className="fav-section">
      <div className="fav-inner">
        <div className="fav-head">
          <h2 className="fav-title">Nuestros favoritos</h2>
          <Link to="/menu" className="fav-link">Ver el menú completo</Link>
        </div>

        <ul className="fav-grid">
          {platos
            ? platos.map((plato) => (
                <li key={plato.id}>
                  <button type="button" className="fav-plato" onClick={() => setAbierto(plato)}>
                    <img src={fotoDePlato(plato)} alt="" loading="lazy" className="fav-foto" />
                    <span className="fav-linea">
                      <span className="fav-nombre">{plato.nombre}</span>
                      <span className="fav-precio">{fmtPrecio(plato.precio)}</span>
                    </span>
                    {plato.descripcion && <span className="fav-desc">{plato.descripcion}</span>}
                  </button>
                </li>
              ))
            : [0, 1, 2].map((i) => <li key={i} className="fav-cargando" aria-hidden="true" />)}
        </ul>
      </div>

      {abierto && (
        <ProductModal
          item={{
            id: abierto.id,
            name: abierto.nombre,
            price: fmtPrecio(abierto.precio),
            priceNum: Number(abierto.precio),
            img: fotoDePlato(abierto),
            desc: abierto.descripcion,
          }}
          onClose={() => setAbierto(null)}
        />
      )}
    </section>
  );
};

export default Favorites;
