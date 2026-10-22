
/**
 * Vêtement suspendu qui pivote sur son cintre (FRONT ↔ BACK).
 * - Le cintre reste fixe, seul le vêtement tourne (rotateY sur deux faces).
 * - Changer de coloris déclenche un balayage de bas en haut, comme sur le portant de référence.
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

  return (
    <div className={`relative aspect-[400/550] ${className ?? ""}`} style={{ perspective: 1800 }}>
      {hanger && <Hanger rail={rail} className="absolute inset-0 h-full w-full" />}
      <AnimatePresence initial={false}>
        <motion.div
          key={`${product.slug}-${colorway.id}`}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ zIndex: 0, transition: { duration: 0.8 } }}
          style={{ zIndex: 1 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Le pivot se fait sur l'axe du crochet */}
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
            initial={{ rotateY }}
            animate={{ rotateY }}
            transition={reduce ? { duration: 0 } : { duration: 1.05, ease: [0.65, 0, 0.35, 1] }}
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
