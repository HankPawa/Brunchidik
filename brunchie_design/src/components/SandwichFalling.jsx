import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import panVolando from "../assets/pan_volando.png";
import panCaido  from "../assets/pan_caido.png";
import "./SandwichFalling.css";

gsap.registerPlugin(ScrollTrigger);

const SandwichFalling = ({ heroSelector = ".hero-bg" }) => {
  const wrapperRef = useRef(null);
  const volandoRef = useRef(null);
  const caidoRef   = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const volando = volandoRef.current;
    const caido   = caidoRef.current;
    if (!wrapper) return;

    const hero   = document.querySelector(heroSelector);
    const footer = document.querySelector("footer");
    if (!hero || !footer) return;

    // Espera a que la página esté completamente renderizada
    ScrollTrigger.refresh();

    // Estado inicial — oculto arriba
    gsap.set(wrapper, { position: "fixed", top: 60, right: 24, left: "auto", x: 0, y: -80, rotation: -12, opacity: 0 });
    gsap.set(caido,   { opacity: 0, scale: 0.8 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "bottom top",
        endTrigger: footer,
        end: "top bottom",
        scrub: 1.5,

        // Al salir por abajo: convierte a absolute justo antes del footer
        onLeave: () => {
          const footerTop = footer.getBoundingClientRect().top + window.scrollY;
          gsap.set(wrapper, {
            position: "absolute",
            top: footerTop - wrapper.offsetHeight - 380,
            right: 24,
            left: "auto",
            y: 0, x: 0, rotation: 0, opacity: 1,
          });
          gsap.set(volando, { opacity: 0 });
          gsap.set(caido,   { opacity: 1, scale: 1 });
        },

        // Al volver a entrar desde abajo: vuelve a fixed para que el scrub lo mueva
        onEnterBack: () => {
          gsap.set(wrapper, {
            position: "fixed",
            top: 60, right: 24, left: "auto",
            y: "57vh", x: 0, rotation: 0, opacity: 1,
          });
          gsap.set(volando, { opacity: 0 });
          gsap.set(caido,   { opacity: 1, scale: 1 });
        },

        // Al salir por arriba del hero: se oculta
        onLeaveBack: () => {
          gsap.set(wrapper, {
            position: "fixed",
            top: 60, right: 24, left: "auto",
            opacity: 0, y: -80, rotation: -12,
          });
          gsap.set(caido,   { opacity: 0, scale: 0.8 });
          gsap.set(volando, { opacity: 1 });
        },
      },
    });

    // Fase 1: aparece planeando
    tl.to(wrapper, {
      opacity: 1, y: 0, rotation: -5,
      duration: 0.2, ease: "power1.out",
    })
    // Fase 2: se inclina suave
    .to(wrapper, {
      y: "20vh", x: 10, rotation: 5,
      ease: "none", duration: 0.25,
    })
    // Fase 3: cae con aceleración controlada
    .to(wrapper, {
      y: "55vh", x: 20, rotation: 28,
      ease: "power1.in", duration: 0.4,
    })
    // Fase 4: impacto
    .to(volando, { opacity: 0, duration: 0.05 }, "-=0.05")
    .to(caido,   { opacity: 1, scale: 1, duration: 0.08, ease: "back.out(1.5)" }, "<")
    // Fase 5: queda quieto
    .to(wrapper, {
      rotation: 0, x: 0, y: "57vh",
      duration: 0.1, ease: "power1.out",
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [heroSelector]);

  return (
    <div className="sw-wrapper" ref={wrapperRef}>
      <img ref={volandoRef} src={panVolando} alt="pan volando" className="sw-img" />
      <img ref={caidoRef}   src={panCaido}   alt="pan caido"   className="sw-img sw-img-caido" />
    </div>
  );
};

export default SandwichFalling;
