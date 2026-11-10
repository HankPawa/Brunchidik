import pancakes from "../assets/pancakes.jpg";
import avocado from "../assets/avocado.jpg";
import englisheggs from "../assets/englisheggs.jpg";
import torrejon from "../assets/torrejon.jpg";
import baconeggs from "../assets/baconeggs.webp";
import eggs from "../assets/eggs.jpg";
import matcha_latte from "../assets/matcha_latte.jpg";
import mimosa_coctel from "../assets/mimosa_coctel.jpg";
import kombucha from "../assets/kombucha.jpg";

// Fotos propias de los platos, por nombre tal como está en la base. Las usan
// la carta y los favoritos de la portada, así que viven en un solo sitio.
// Si un plato tiene imagenUrl en la base, la foto local manda igualmente.
const FOTOS = {
  "Pancakes": pancakes,
  "Bacon Eggs": baconeggs,
  "Muffin Inglés con Huevos": englisheggs,
  "Avocado Toast Campestre": avocado,
  "Eggs Benedict": eggs,
  "Torrijas de Ricotta": torrejon,
  "Mimosa": mimosa_coctel,
  "Kombucha": kombucha,
  "Matcha Latte": matcha_latte,
};

export const fotoDePlato = (plato) => FOTOS[plato.nombre] || plato.imagenUrl || null;
