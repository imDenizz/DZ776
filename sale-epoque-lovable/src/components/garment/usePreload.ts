
import { useEffect } from "react";
import type { Product } from "@/data/products";

/** Précharge les visuels de tous les coloris d'une pièce, pour un changement de coloris sans blanc. */
export function usePreloadColorways(product: Product) {
  useEffect(() => {
    for (const c of product.colorways) {
      if (!c.image) continue;
      for (const src of [c.image.front, c.image.back]) {
        const img = new Image();
        img.src = src;
      }
    }
  }, [product]);
}
