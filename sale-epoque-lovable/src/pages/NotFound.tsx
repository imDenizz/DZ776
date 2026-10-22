import { useSeo } from "@/lib/seo";
import Link from "@/lib/router";

export default function NotFound() {
  useSeo({ title: "Page introuvable", noindex: true });
  return (
    <section className="flex min-h-[calc(100svh-var(--marquee-h))] flex-col items-center justify-center px-4 pt-[var(--header-h)] text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Erreur 404</p>
      <h1 className="mt-4 font-display text-[clamp(4rem,16vw,12rem)] uppercase leading-[0.85]">
        Cette page
        <br />
        <span className="text-militant">n&apos;existe pas.</span>
      </h1>
      <p className="mt-6 max-w-md text-ink/70">Le lien est cassé ou la pièce a quitté le portant.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="flex h-12 items-center bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-militant">
          Retour au portant
        </Link>
        <Link href="/shop" className="flex h-12 items-center border border-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-paper">
          Le shop
        </Link>
      </div>
    </section>
  );
}
