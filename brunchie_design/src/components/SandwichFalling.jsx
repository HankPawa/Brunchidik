import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import panVolando from "../assets/pan_volando.png";
import panCaido  from "../assets/pan_caido.png";
import "./SandwichFalling.css";

gsap.registerPlugin(ScrollTrigger);

const SandwichFalling = ({ heroSelector = ".hero-bg", rightOffset = 24 }) => {
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

    ScrollTrigger.refresh();

    gsap.set(wrapper, { position: "fixed", top: 60, right: rightOffset, left: "auto", x: 0, y: -80, rotation: -12, opacity: 0 });
    gsap.set(caido,   { opacity: 0, scale: 0.8 });

    // Umbral de progreso donde ocurre el impacto (85% del recorrido)
    const IMPACT = 0.85;

    const swapImagen = (progress) => {
      if (progress >= IMPACT) {
        gsap.set(volando, { opacity: 0 });
        gsap.set(caido,   { opacity: 1, scale: 1 });
      } else {
        gsap.set(volando, { opacity: 1 });
        gsap.set(caido,   { opacity: 0, scale: 0.8 });
      }
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "bottom top",
        endTrigger: footer,
        end: "top bottom",
        scrub: 1.5,

        // Controla el swap de imagen limpiamente por progreso, sin depender del scrub
        onUpdate: (self) => swapImagen(self.progress),

        onLeave: () => {
          const footerTop = footer.getBoundingClientRect().top + window.scrollY;
          gsap.set(wrapper, {
            position: "absolute",
            top: footerTop - wrapper.offsetHeight - 380,
            right: rightOffset,
            left: "auto",
            y: 0, x: 0, rotation: 0, opacity: 1,
          });
          gsap.set(volando, { opacity: 0 });
          gsap.set(caido,   { opacity: 1, scale: 1 });
        },

        onEnterBack: () => {
          gsap.set(wrapper, {
            position: "fixed",
            top: 60, right: rightOffset, left: "auto",
            y: "57vh", x: 0, rotation: 0, opacity: 1,
          });
          // La imagen la controla onUpdate según el progreso actual
        },

        onLeaveBack: () => {
          gsap.set(wrapper, {
            position: "fixed",
            top: 60, right: rightOffset, left: "auto",
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
    // Fase 3: cae
    .to(wrapper, {
      y: "55vh", x: 20, rotation: 28,
      ease: "power1.in", duration: 0.4,
    })
    // Fase 4: queda quieto (sin swap de imagen — lo hace onUpdate)
    .to(wrapper, {
      rotation: 0, x: 0, y: "57vh",
      duration: 0.15, ease: "power1.out",
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [heroSelector]);

  return (
    <div className="sw-wrapper" ref={wrapperRef} style={{ right: rightOffset }}>
      <img ref={volandoRef} src={panVolando} alt="pan volando" className="sw-img" />
      <img ref={caidoRef}   src={panCaido}   alt="pan caido"   className="sw-img sw-img-caido" />
    </div>
  );
};

export default SandwichFalling;
