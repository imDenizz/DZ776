import { motion } from "motion/react";
import { DUR, EASE, enter } from "@/lib/motion";

/**
 * Transition d'entrée commune à toutes les pages (re-montée à chaque navigation).
 * PRIMAIRE : le rideau noir se lève (500 ms, durée « transition de page » du skill).
 * SECONDAIRE : un liseré rouge suit le rideau avec 60 ms de retard (suite / chevauchement).
 * Puis la page monte de 24 px (entrée type « affiche collée »).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] origin-top bg-militant"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: DUR.slow, delay: 0.06, ease: EASE.inOut }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.inOut }}
      />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={enter(DUR.slow, 0.25)}>
        {children}
      </motion.div>
    </>
  );
}
