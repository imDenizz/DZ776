import Link from "@/lib/router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { Garment } from "@/components/garment/Garment";
import { DUR, SPRING, leave } from "@/lib/motion";

/** Index typographique de la collection — la pièce survolée apparaît en aperçu (desktop). */
export function CollectionIndex({ products }: { products: (Product & { priceLabel: string })[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const p = hover !== null ? products[hover] : null;

  return (
    <div className="relative border-t border-paper/15" onMouseLeave={() => setHover(null)}>
      <ul className="mx-auto max-w-7xl px-4 md:px-8">
        {products.map((prod, i) => (
          <li key={prod.slug} className="border-b border-paper/15">
            <Link
              href={`/produit/${prod.slug}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 md:grid-cols-[4rem_1fr_1fr_auto] md:py-7"
            >
              <span className="font-mono text-xs text-paper/50">{prod.number}</span>
              <span className="font-display text-3xl uppercase leading-none transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-militant md:text-6xl">
                {prod.name}
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60 md:block">
                « {prod.slogan.lines.join(" ")} »
              </span>
              <span className="font-mono text-sm">{prod.priceLabel}</span>
            </Link>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {p && (
          <motion.div
            key={p.slug}
            aria-hidden="true"
            className="pointer-events-none fixed right-[8vw] top-1/2 z-30 hidden w-[min(22vw,320px)] -translate-y-1/2 md:block"
            initial={{ opacity: 0, rotate: -6, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, rotate: 3, scale: 1, y: 0, transition: SPRING.fabric }}
            exit={{ opacity: 0, rotate: 8, scale: 0.96, transition: leave(DUR.standard) }}
          >
            <Garment product={p} colorway={p.colorways[0]} side="back" decorative className="w-full drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-16" />
    </div>
  );
}
