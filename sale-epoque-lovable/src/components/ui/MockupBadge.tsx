/** Signale clairement qu'un visuel est une maquette, pas une photo de la pièce réelle. */
export function MockupBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-dashed border-ink/40 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60 ${className ?? ""}`}
      title="Les photos définitives seront ajoutées à la production."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-militant" aria-hidden="true" />
      Maquette — visuel temporaire
    </span>
  );
}
