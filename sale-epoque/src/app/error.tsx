"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[calc(100svh-var(--marquee-h))] flex-col items-center justify-center px-4 pt-[var(--header-h)] text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Erreur</p>
      <h1 className="mt-4 font-display text-[clamp(3.5rem,12vw,9rem)] uppercase leading-[0.85]">Quelque chose a lâché.</h1>
      <p className="mt-6 max-w-md text-ink/70">Un problème est survenu en affichant cette page.</p>
      <button type="button" onClick={reset} className="mt-8 flex h-12 items-center bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-militant">
        Réessayer
      </button>
    </section>
  );
}
