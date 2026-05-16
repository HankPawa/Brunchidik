import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./SandwichFalling.css";

gsap.registerPlugin(ScrollTrigger);

const SandwichFalling = () => {
  const sandwichRef = useRef(null);

  useEffect(() => {
    const el = sandwichRef.current;
    if (!el) return;

    // Brazo izquierdo y derecho
    const armL = el.querySelector(".sw-arm-left");
    const armR = el.querySelector(".sw-arm-right");
    const legL = el.querySelector(".sw-leg-left");
    const legR = el.querySelector(".sw-leg-right");

    // Animación de caída al hacer scroll
    gsap.fromTo(el,
      { y: -120, rotation: -8, opacity: 0 },
      {
        y: () => window.innerHeight * 0.75,
        rotation: 15,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "+=800",
          scrub: 1.2,
        },
      }
    );

    // Brazos y piernas se agitan mientras cae
    gsap.to([armL, armR], {
      rotation: "+=25",
      transformOrigin: "top center",
      duration: 0.35,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.18,
    });

    gsap.to([legL, legR], {
      rotation: "+=20",
      transformOrigin: "top center",
      duration: 0.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.2,
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="sw-wrapper" ref={sandwichRef}>
      <svg viewBox="0 0 120 130" className="sw-svg" xmlns="http://www.w3.org/2000/svg">

        {/* ── Brazo izquierdo ── */}
        <g className="sw-arm-left">
          <line x1="22" y1="62" x2="4" y2="80" stroke="#c8a26a" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="4" cy="82" r="5" fill="#f4c97a"/>
        </g>

        {/* ── Brazo derecho ── */}
        <g className="sw-arm-right">
          <line x1="98" y1="62" x2="116" y2="80" stroke="#c8a26a" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="116" cy="82" r="5" fill="#f4c97a"/>
        </g>

        {/* ── Pan de arriba ── */}
        <ellipse cx="60" cy="38" rx="42" ry="22" fill="#f4c97a"/>
        <ellipse cx="60" cy="32" rx="38" ry="18" fill="#f9dfa0"/>

        {/* ── Ojos ── */}
        <circle cx="46" cy="30" r="7" fill="white"/>
        <circle cx="74" cy="30" r="7" fill="white"/>
        <circle cx="48" cy="31" r="3.5" fill="#2d2d2d"/>
        <circle cx="76" cy="31" r="3.5" fill="#2d2d2d"/>
        {/* Brillo */}
        <circle cx="49.5" cy="29.5" r="1.5" fill="white"/>
        <circle cx="77.5" cy="29.5" r="1.5" fill="white"/>

        {/* Boca */}
        <path d="M 50 42 Q 60 50 70 42" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Mejillas */}
        <ellipse cx="37" cy="40" rx="6" ry="4" fill="#f4a0a0" opacity="0.6"/>
        <ellipse cx="83" cy="40" rx="6" ry="4" fill="#f4a0a0" opacity="0.6"/>

        {/* ── Lechuga ── */}
        <ellipse cx="60" cy="58" rx="44" ry="9" fill="#5cb85c"/>
        <path d="M18 56 Q30 48 42 56 Q54 48 66 56 Q78 48 90 56 Q102 48 102 58" fill="#4cae4c" stroke="none"/>

        {/* ── Tomate ── */}
        <ellipse cx="60" cy="66" rx="40" ry="7" fill="#e74c3c"/>

        {/* ── Queso ── */}
        <ellipse cx="60" cy="72" rx="43" ry="7" fill="#f39c12"/>
        <polygon points="18,68 28,78 18,78" fill="#e67e22"/>
        <polygon points="102,68 92,78 102,78" fill="#e67e22"/>

        {/* ── Pan de abajo ── */}
        <ellipse cx="60" cy="82" rx="44" ry="10" fill="#f4c97a"/>
        <ellipse cx="60" cy="86" rx="44" ry="8" fill="#e8b84b"/>

        {/* ── Pierna izquierda ── */}
        <g className="sw-leg-left">
          <line x1="42" y1="90" x2="32" y2="112" stroke="#c8a26a" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="30" cy="116" rx="8" ry="5" fill="#f4c97a"/>
        </g>

        {/* ── Pierna derecha ── */}
        <g className="sw-leg-right">
          <line x1="78" y1="90" x2="88" y2="112" stroke="#c8a26a" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="90" cy="116" rx="8" ry="5" fill="#f4c97a"/>
        </g>

      </svg>
    </div>
  );
};

export default SandwichFalling;
