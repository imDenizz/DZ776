"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Recharge le panier sauvegardé après le premier rendu (évite les écarts SSR).
    void useCart.persist.rehydrate();
  }, []);
  // `reducedMotion="user"` : respecte prefers-reduced-motion pour toutes les animations Motion.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
