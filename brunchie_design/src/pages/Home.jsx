import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Favorites from "../components/Favorites";
import MapSection from "../components/MapSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Favorites />
      <MapSection />
      <Footer />
    </>
  );
};

export default Home;