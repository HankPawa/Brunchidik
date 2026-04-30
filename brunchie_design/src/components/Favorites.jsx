import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import eggs from "../assets/eggs.jpg";
import "./Favorites.css";

const Favorites = () => {
  const items = [
    { name: "Pancakes", img: pancakes },
    { name: "Avocado Toast", img: avocado },
    { name: "Eggs Benedict", img: eggs },
  ];

  return (
    <section className="section has-background-light">
      <div className="container has-text-centered">
        <h2 className="title is-4">Nuestros Favoritos</h2>

        <div className="columns is-centered mt-5">
          {items.map((item, i) => (
            <div className="column is-3" key={i}>
              <div className="card custom-card">
                <div className="card-image">
                  <figure className="image is-4by3">
                    <img src={item.img} alt={item.name} />
                  </figure>
                </div>
                <div className="card-content">
                  <p>{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="button is-black is-small mt-4">
          Ver menú completo
        </button>
      </div>
    </section>
  );
};

export default Favorites;