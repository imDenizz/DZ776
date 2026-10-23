"use client";

/**
 * Vêtement suspendu qui pivote sur son cintre (FRONT ↔ BACK).
 * - Le cintre reste fixe, seul le vêtement tourne (rotateY sur deux faces).
 * - Changer de coloris déclenche un balayage de bas en haut, comme sur le portant de référence.
 *
 * Mouvement (principes Disney du skill) :
 *  - ANTICIPATION : le vêtement amorce 12° dans l'autre sens avant de tourner ;
 *  - ACTION : demi-tour en ease-in-out (mouvement à l'écran) ;
 *  - SUITE : le tissu dépasse de 8° puis revient (poids, pas de rebond élastique) ;
 *  - SECONDAIRE : l'ombre au sol se resserre quand le vêtement est vu de profil.
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { DUR, EASE } from "@/lib/motion";
import type { Colorway, Product } from "@/data/products";
import { Garment, Hanger, type Side } from "./Garment";

type Props = {
  product: Product;
  colorway: Colorway;
  side: Side;
  hanger?: boolean;
  /** Dessine aussi un tronçon de tringle traversant le cadre. */
  rail?: boolean;
  lite?: boolean;
  className?: string;
};

export function FlipGarment({ product, colorway, side, hanger = true, rail = false, lite = false, className }: Props) {
  const reduce = useReducedMotion();
  const rotateY = side === "back" ? 180 : 0;
  // Face précédente, mise à jour après le rendu (sûr en double rendu StrictMode).
  const prev = useRef(rotateY);
  const from = prev.current;
  const turning = from !== rotateY;
  useEffect(() => {
    prev.current = rotateY;
  }, [rotateY]);
  const dir = rotateY > from ? 1 : -1;
  // anticipation → action → dépassement → repos
  const keys = turning ? [from, from - 12 * dir, rotateY + 8 * dir, rotateY] : rotateY;
  const flip = turning && !reduce ? { duration: DUR.drama * 1.25, times: [0, 0.2, 0.82, 1], ease: [EASE.out, EASE.inOut, EASE.out] } : { duration: 0 };

  return (
    <div className={`relative aspect-[400/550] ${className ?? ""}`} style={{ perspective: 1800 }}>
      {hanger && <Hanger rail={rail} className="absolute inset-0 h-full w-full" />}
      {/* Ombre au sol : se resserre au moment où le vêtement est de profil. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[20%] -bottom-[2%] h-[4%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(30,24,16,0.25),transparent)]"
        key={`shadow-${rotateY}`}
        initial={false}
        animate={turning && !reduce ? { scaleX: [1, 1.08, 0.3, 1.04, 1] } : { scaleX: 1 }}
        transition={{ duration: DUR.drama * 1.25, times: [0, 0.2, 0.5, 0.82, 1], ease: EASE.inOut }}
      />
      <AnimatePresence initial={false}>
        <motion.div
          key={`${product.slug}-${colorway.id}`}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ zIndex: 0, transition: { duration: DUR.drama } }}
          style={{ zIndex: 1 }}
          transition={{ duration: DUR.drama * 0.85, ease: EASE.inOut }}
        >
          {/* Le pivot se fait sur l'axe du crochet */}
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
            initial={{ rotateY }}
            animate={{ rotateY: keys }}
            transition={flip}
          >
            <Face>
              <Garment product={product} colorway={colorway} side="front" lite={lite} className="h-full w-full garment-shadow" />
            </Face>
            <Face back>
              <Garment product={product} colorway={colorway} side="back" lite={lite} className="h-full w-full garment-shadow" />
            </Face>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Face({ children, back = false }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
