"use client";

/**
 * Retours d'interaction communs (skill motion-design, « state & feedback ») :
 *  - <Shake> : secousse d'erreur ferme, sans dépassement, rejouée à chaque incrément de `trigger`.
 *  - <AddToCartButton> : pression (98 %, < 150 ms), succès (« Ajouté » qui claque puis revient).
 */
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DUR, EASE, SHAKE, enter, leave } from "@/lib/motion";

export function Shake({ trigger, children, className }: { trigger: number; children: ReactNode; className?: string }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!trigger || !scope.current) return;
    if (reduce) {
      // Mouvement réduit : un simple clignement d'opacité, pas de déplacement.
      animate(scope.current, { opacity: [1, 0.5, 1] }, { duration: DUR.slow });
    } else {
      animate(scope.current, { x: SHAKE.x }, SHAKE.transition);
    }
  }, [trigger, animate, reduce, scope]);
  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

export function AddToCartButton({
  label,
  price,
  onAdd,
  className,
}: {
  label: string;
  price: string;
  /** Retourne true si l'article a bien été ajouté (false : erreur gérée par l'appelant). */
  onAdd: () => boolean;
  className?: string;
}) {
  const [done, setDone] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!onAdd()) return;
        setDone((d) => d + 1);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(0), 1400);
      }}
      whileHover={{ scale: 1.01, transition: { duration: DUR.micro, ease: EASE.out } }}
      whileTap={{ scale: 0.98, transition: { duration: DUR.micro, ease: EASE.out } }}
      className={`relative flex items-center justify-between overflow-hidden px-5 font-display text-lg uppercase tracking-wide text-paper transition-colors duration-200 ${
        done ? "bg-militant" : "bg-ink hover:bg-militant"
      } ${className ?? ""}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.span
            key={`ok-${done}`}
            className="flex items-center gap-2"
            initial={{ y: 22, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 520, damping: 24 } }}
            exit={{ y: -18, opacity: 0, transition: leave(DUR.quick) }}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <motion.path
                d="M2.5 8.5 6.5 12 13.5 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="square"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: enter(DUR.quick, 0.1) }}
              />
            </svg>
            Ajouté
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: enter(DUR.standard) }}
            exit={{ y: -18, opacity: 0, transition: leave(DUR.quick) }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      <span>{price}</span>
      <span className="sr-only" role="status">
        {done ? "Article ajouté au panier" : ""}
      </span>
    </motion.button>
  );
}
