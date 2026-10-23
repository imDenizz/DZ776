"use client";

import { motion } from "motion/react";
import { DUR, SPRING } from "@/lib/motion";
import type { Colorway } from "@/data/products";

/**
 * Étiquettes cartonnées suspendues : une par coloris (repris du portant de référence).
 * Mouvement : carton léger au bout d'un fil → balancier vif (SPRING.tag) ;
 * l'étiquette choisie descend et se redresse, les autres restent de biais.
 */
export function HangTags({
  colorways,
  value,
  onChange,
  className,
}: {
  colorways: Colorway[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Coloris" className={`flex items-start gap-2 ${className ?? ""}`}>
      {colorways.map((c, i) => {
        const active = c.id === value;
        return (
          <motion.button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Coloris ${c.name}`}
            onClick={() => onChange(c.id)}
            className="group relative flex flex-col items-center outline-offset-4"
            initial={{ rotate: i % 2 ? 14 : -12, y: -14, opacity: 0 }}
            animate={{ rotate: active ? 0 : i % 2 ? 4 : -3, y: active ? 6 : 0, opacity: 1 }}
            whileHover={{ rotate: 0, y: 4 }}
            whileTap={{ y: 10, transition: { duration: DUR.micro } }}
            transition={{ ...SPRING.tag, delay: 0.04 * i, opacity: { duration: DUR.quick, delay: 0.04 * i } }}
            style={{ transformOrigin: "50% 0%" }}
          >
            <span className="h-8 w-px bg-ink/40" aria-hidden="true" />
            <span
              className={`relative flex h-[5.5rem] w-9 flex-col items-center justify-between rounded-[3px] pb-2 pt-2 shadow-[0_6px_12px_-6px_rgba(0,0,0,.5)] ring-1 transition ${
                active ? "ring-militant ring-2" : "ring-ink/15"
              }`}
              style={{ background: c.fabric }}
            >
              <span className="h-2 w-2 rounded-full bg-paper ring-1 ring-ink/30" aria-hidden="true" />
              <span
                className="font-mono text-[9px] uppercase tracking-[0.18em] [writing-mode:vertical-rl]"
                style={{ color: c.ink }}
              >
                {c.name}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
