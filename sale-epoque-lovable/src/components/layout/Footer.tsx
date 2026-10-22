import Link from "@/lib/router";
import { BRAND, COLLECTION } from "@/config/brand";
import { LEGAL_PAGES } from "@/data/legal";
import { NAV } from "@/config/nav";
import { Socials } from "./Socials";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.85]">
            {BRAND.wordmark[0]}
            <br />
            <span className="text-militant">{BRAND.wordmark[1]}</span>
          </p>
          <p className="mt-6 max-w-sm text-sm text-paper/70">{BRAND.description}</p>
        </div>
        <nav aria-label="Pages">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">Navigation</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-display text-xl uppercase hover:text-militant">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">Réseaux</p>
          <Socials className="mt-4" />
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">Infos</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {LEGAL_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/infos/${p.slug}`} className="text-paper/80 underline-offset-4 hover:text-paper hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50 md:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()} {BRAND.name} — {COLLECTION.full}
          </p>
          <p>Prototype — paiement non activé, aucune commande n&apos;est encaissée.</p>
        </div>
      </div>
    </footer>
  );
}
