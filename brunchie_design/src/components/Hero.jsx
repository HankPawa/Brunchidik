import heroImg from "../assets/hero.jpg";
import "./Hero.css";

const Hero = () => {
  return (
    <section
  className="hero is-medium hero-bg"
  style={{ backgroundImage: `url(${heroImg})` }}
>
  <div className="overlay">
    <div className="hero-body has-text-centered">
      <h1 className="title has-text-white">Brunch & Co.</h1>
      <p className="subtitle has-text-white">
        Donde cada mañana se convierte en una experiencia especial
      </p>
    </div>
  </div>
</section>
  );
};

export default Hero;