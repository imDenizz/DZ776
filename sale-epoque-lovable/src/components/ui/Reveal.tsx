
import { motion } from "motion/react";

/** Apparition progressive au scroll (désactivée automatiquement si mouvement réduit). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "p" | "h2";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  );
}

/** Titre révélé ligne par ligne, façon affiche collée. */
export function LineReveal({
  lines,
  className,
  delay = 0,
  onView = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  delay?: number;
  /** false : joue au chargement (titres en haut de page). true : joue à l'entrée dans l'écran. */
  onView?: boolean;
}) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="-mt-[0.14em] block overflow-hidden pb-[0.04em] pt-[0.14em]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            {...(onView ? { whileInView: { y: 0 }, viewport: { once: true } } : { animate: { y: 0 } })}
            transition={{ duration: 0.9, delay: delay + (onView ? 0 : 0.35) + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
