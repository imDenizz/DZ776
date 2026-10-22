import { BRAND } from "@/config/brand";

/** Liens réseaux : un compte sans URL configurée s'affiche « bientôt », sans faux lien. */
export function Socials({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const muted = tone === "dark" ? "text-paper/40" : "text-ink/40";
  return (
    <ul className={`space-y-2 ${className ?? ""}`}>
      {BRAND.socials.map((s) => (
        <li key={s.label} className="flex items-baseline justify-between gap-4">
          {s.href ? (
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-display text-xl uppercase hover:text-militant">
              {s.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className={`font-display text-xl uppercase ${muted}`}>{s.label}</span>
          )}
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>{s.href ? s.handle : "bientôt"}</span>
        </li>
      ))}
    </ul>
  );
}
