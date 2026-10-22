"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/catalog";
import { Garment, Hanger } from "@/components/garment/Garment";

/** Carte produit : au survol, la pièce pivote sur son cintre pour montrer le dos. */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const cw = product.colorways[0];
  return (
    <Link href={`/produit/${product.slug}`} className="group block" aria-label={`${product.name} — ${product.label}, ${formatPrice(product.price)}`}>
      <div className="wall relative aspect-[4/5] overflow-hidden">
        <span className="absolute left-3 top-3 z-10 font-mono text-[10px] tracking-[0.2em] text-ink/60">N°{product.number}</span>
        <span className="absolute right-3 top-3 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          Voir le dos
        </span>
        <div className="absolute inset-x-[8%] bottom-[2%] top-[4%]" style={{ perspective: 1400 }}>
          <Hanger rail className="absolute inset-0 h-full w-full" />
          <div
            className="relative h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] motion-reduce:transition-none"
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <Garment product={product} colorway={cw} side="front" lite decorative className="garment-shadow h-full w-full" />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Garment product={product} colorway={cw} side="back" lite={!priority} decorative className="garment-shadow h-full w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl uppercase leading-none transition-colors group-hover:text-militant">{product.name}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">
            {product.label} — {product.colorways.length > 1 ? `${product.colorways.length} coloris` : product.colorways[0].name}
          </p>
        </div>
        <p className="font-mono text-sm">{formatPrice(product.price)}</p>
      </div>
      <motion.div className="mt-3 h-[2px] origin-left bg-ink" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
    </Link>
  );
}
