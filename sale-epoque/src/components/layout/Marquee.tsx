"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";

const KEY = "sale-epoque-ambient";

/**
 * Bandeau défilant fixé en bas de l'écran (animation CSS, coupée si mouvement réduit).
 * Il se met en pause au survol, et un bouton met en pause toutes les animations d'ambiance
 * (bandeau + balancement des cintres) — règle du skill : toute animation de plus de 5 s doit pouvoir s'arrêter.
 */
export function Marquee() {
  const text = BRAND.marquee;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      setPaused(localStorage.getItem(KEY) === "paused");
    } catch {
      /* stockage indisponible : lecture par défaut */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.ambient = paused ? "paused" : "playing";
    try {
      localStorage.setItem(KEY, paused ? "paused" : "playing");
    } catch {
      /* ignore */
    }
  }, [paused]);

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...text, ...text].map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5">{t}</span>
          <span className="text-ink" aria-hidden="true">
            ✕
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee fixed inset-x-0 bottom-0 z-[55] flex h-[var(--marquee-h)] border-t border-ink bg-militant font-display text-sm uppercase tracking-[0.08em] text-paper">
      <p className="sr-only">{text.join(" — ")}</p>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track flex h-full w-max items-center" aria-hidden="true">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Relancer les animations d'ambiance" : "Mettre en pause les animations d'ambiance"}
        className="grid w-[var(--marquee-h)] shrink-0 place-items-center border-l border-ink bg-ink text-paper hover:bg-paper hover:text-ink"
      >
        {paused ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
            <path d="M3 1.5v9l7-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
