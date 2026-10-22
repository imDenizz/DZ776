import { BRAND } from "@/config/brand";

/** Bandeau défilant fixé en bas de l'écran. Animation CSS pure (coupée si mouvement réduit). */
export function Marquee() {
  const text = BRAND.marquee;
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
    <div className="fixed inset-x-0 bottom-0 z-[55] h-[var(--marquee-h)] overflow-hidden border-t border-ink bg-militant font-display text-sm uppercase tracking-[0.08em] text-paper">
      <p className="sr-only">{text.join(" — ")}</p>
      <div className="marquee-track flex h-full w-max items-center" aria-hidden="true">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
