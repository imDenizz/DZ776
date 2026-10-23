"use client";

import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";
import { useId } from "react";
import type { Side } from "./Garment";

/** Interrupteur FRONT / BACK en pilule, avec indicateur glissant. */
export function SideToggle({
  value,
  onChange,
  tone = "light",
  size = "md",
}: {
  value: Side;
  onChange: (s: Side) => void;
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const id = useId();
  const dark = tone === "dark";
  return (
    <div
      role="radiogroup"
      aria-label="Face du vêtement"
      className={`inline-flex rounded-full border p-1 ${dark ? "border-paper/30" : "border-ink/25"} ${size === "lg" ? "text-sm" : "text-xs"}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          onChange(value === "front" ? "back" : "front");
        }
      }}
    >
      {(["front", "back"] as const).map((s) => {
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(s)}
            className={`relative min-w-[4.5rem] rounded-full font-mono uppercase tracking-[0.18em] transition-colors ${
              size === "lg" ? "px-5 py-2.5" : "px-4 py-2"
            } ${active ? (dark ? "text-ink" : "text-paper") : dark ? "text-paper/70 hover:text-paper" : "text-ink/60 hover:text-ink"}`}
          >
            {active && (
              <motion.span
                layoutId={`side-pill-${id}`}
                className={`absolute inset-0 rounded-full ${dark ? "bg-paper" : "bg-ink"}`}
                transition={SPRING.ui}
              />
            )}
            <span className="relative">{s === "front" ? "Front" : "Back"}</span>
          </button>
        );
      })}
    </div>
  );
}
