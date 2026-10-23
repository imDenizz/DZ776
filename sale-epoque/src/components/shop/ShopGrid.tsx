"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GarmentType, Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { DUR, SPRING, STAGGER, enter, leave, stagger } from "@/lib/motion";

const FILTERS: { id: "all" | GarmentType; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "hoodie", label: "Hoodies" },
  { id: "tshirt", label: "T-shirts" },
];

const SORTS = [
  { id: "collection", label: "Ordre de la collection" },
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

/** Filtres et tri synchronisés avec l'URL (partageables, retour arrière OK). */
export function ShopGrid({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const type = (FILTERS.find((f) => f.id === params.get("type"))?.id ?? "all") as "all" | GarmentType;
  const sort = (SORTS.find((s) => s.id === params.get("tri"))?.id ?? "collection") as SortId;

  const set = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const list = products
    .filter((p) => type === "all" || p.type === type)
    .sort((a, b) => (sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0));

  return (
    <>
      <div className="sticky top-[var(--header-h)] z-20 -mx-4 mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-ink bg-paper/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div role="group" aria-label="Filtrer par type" className="flex gap-1.5">
          {FILTERS.map((f) => {
            const active = f.id === type;
            const count = f.id === "all" ? products.length : products.filter((p) => p.type === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => set("type", f.id, "all")}
                className={`relative h-10 rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${active ? "text-paper" : "hover:bg-ink/5"}`}
              >
                {active && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-ink" transition={SPRING.ui} />}
                <span className="relative">
                  {f.label} <sup className="text-[9px] opacity-60">{count}</sup>
                </span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className="text-ink/60">Trier</span>
          <select
            value={sort}
            onChange={(e) => set("tri", e.target.value, "collection")}
            className="h-10 cursor-pointer rounded-full border border-ink/25 bg-transparent px-3 font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {list.length} pièce{list.length > 1 ? "s" : ""}
      </p>

      {list.length === 0 ? (
        <p className="py-24 text-center font-display text-4xl uppercase">Aucune pièce dans cette catégorie.</p>
      ) : (
        <motion.ul layout className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: enter(DUR.slow, stagger(i, STAGGER.standard)) }}
                exit={{ opacity: 0, scale: 0.96, transition: leave(DUR.standard) }}
                transition={SPRING.fabric}
              >
                <ProductCard product={p} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </>
  );
}
