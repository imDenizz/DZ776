"use client";

import { useEffect, useRef } from "react";
import { SIZE_GUIDE, SIZES, type GarmentType } from "@/data/products";

/** Guide des tailles dans un <dialog> natif (focus, Échap et fond gérés par le navigateur). */
export function SizeGuide({ open, onClose, type }: { open: boolean; onClose: () => void; type: GarmentType }) {
  const ref = useRef<HTMLDialogElement>(null);
  const guide = SIZE_GUIDE[type];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="size-guide-title"
      className="m-auto w-[min(92vw,640px)] bg-paper p-0 text-ink"
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="size-guide-title" className="font-display text-4xl uppercase">
              Guide des tailles
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              {type === "hoodie" ? "Hoodies" : "T-shirts"} — mesures à plat en cm, indicatives (prototype)
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink hover:bg-ink hover:text-paper" aria-label="Fermer le guide des tailles">
            ✕
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <caption className="sr-only">Mesures par taille</caption>
            <thead>
              <tr className="border-b border-ink font-mono text-[10px] uppercase tracking-[0.15em]">
                <th scope="col" className="py-2 pr-4">
                  Taille
                </th>
                {guide.headers.map((h) => (
                  <th key={h} scope="col" className="py-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s} className="border-b border-ink/15">
                  <th scope="row" className="py-2.5 pr-4 font-display text-lg">
                    {s}
                  </th>
                  {guide.rows[s].map((v, i) => (
                    <td key={i} className="py-2.5 pr-4 font-mono">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-sm text-ink/70">
          Coupe volontairement oversize. Entre deux tailles ou pour un rendu plus ajusté, prends une taille en dessous.
        </p>
      </div>
    </dialog>
  );
}
