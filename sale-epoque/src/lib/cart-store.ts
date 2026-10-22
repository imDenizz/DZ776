"use client";

/**
 * Panier côté navigateur (localStorage).
 * Aucune commande n'est enregistrée ici : le passage en caisse passe par /api/checkout,
 * qui refuse tant qu'aucun prestataire de paiement n'est configuré.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_QTY, type Size } from "@/data/products";

export { MAX_QTY };

export type CartLine = {
  slug: string;
  colorwayId: string;
  size: Size;
  qty: number;
};

export const lineKey = (l: Pick<CartLine, "slug" | "colorwayId" | "size">) => `${l.slug}__${l.colorwayId}__${l.size}`;

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => lineKey(l) === key);
          const lines = existing
            ? s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l))
            : [...s.lines, { ...line, qty: Math.min(MAX_QTY, line.qty) }];
          return { lines };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => lineKey(l) !== key) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "sale-epoque-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // Réhydraté manuellement après le montage pour éviter les écarts SSR/client.
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
