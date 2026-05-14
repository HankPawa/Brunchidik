import { useEffect, useState } from "react";
import "./WeatherRecommendation.css";

const API_KEY = "ad91376c322b5e62d181a5ecdf79b8ee";

const recommendations = {
  hot: {
    emoji: "☀️",
    title: "Perfecto para algo refrescante",
    text: "Hoy recomendamos smoothies, soda de café y bebidas frías.",
  },

  rain: {
    emoji: "🌧️",
    title: "Clima ideal para algo cálido",
    text: "Un latte caliente y nuestros pancakes son la combinación perfecta.",
  },

  cold: {
    emoji: "☁️",
    title: "Un brunch acogedor siempre ayuda",
    text: "Prueba nuestros Eggs Benedict y café artesanal.",
  },
};

const WeatherRecommendation = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Neiva,CO&appid=${API_KEY}&units=metric&lang=es`
    )
      .then((res) => res.json())
      .then((data) => {
        const temp = data.main.temp;

        if (temp >= 28) {
          setWeather(recommendations.hot);
        } else if (temp <= 20) {
          setWeather(recommendations.cold);
        } else {
          setWeather(recommendations.rain);
        }
      });
  }, []);

  if (!weather) return null;

  return (
  <section className="weather-section">

    <div className="weather-card">

      <div className="weather-left">

        <span className="weather-emoji">
          {weather.emoji}
        </span>

        <div className="weather-content">

          <span className="weather-badge">
            Recomendación del día
          </span>

          <h2 className="weather-title">
            {weather.title}
          </h2>

          <p className="weather-text">
            {weather.text}
          </p>

        </div>

      </div>

      <button className="weather-btn">
        Ver recomendados
      </button>

    </div>

  </section>
);
};

export default WeatherRecommendation;