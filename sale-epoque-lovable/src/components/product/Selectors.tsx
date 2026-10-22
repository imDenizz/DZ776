
import type { Colorway, Size } from "@/data/products";
import { MAX_QTY } from "@/lib/cart-store";

export function SizeSelector({
  sizes,
  value,
  onChange,
  invalid,
  tone = "light",
  describedBy,
}: {
  sizes: readonly Size[];
  value: Size | null;
  onChange: (s: Size) => void;
  invalid?: boolean;
  tone?: "light" | "dark";
  describedBy?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      role="radiogroup"
      aria-label="Taille"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="grid grid-cols-6 gap-1.5"
    >
      {sizes.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className={`h-11 border font-mono text-xs tracking-wider transition-colors ${
              active
                ? "border-militant bg-militant text-paper"
                : invalid
                  ? "border-militant/70 hover:bg-militant/10"
                  : dark
                    ? "border-paper/30 text-paper hover:border-paper"
                    : "border-ink/25 hover:border-ink"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export function ColorSelector({
  colorways,
  value,
  onChange,
}: {
  colorways: Colorway[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Coloris" className="flex flex-wrap gap-2">
      {colorways.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.id)}
            className={`flex h-11 items-center gap-2.5 border pl-1.5 pr-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              active ? "border-ink" : "border-ink/20 hover:border-ink/60"
            }`}
          >
            <span className="h-7 w-7 ring-1 ring-ink/20" style={{ background: c.fabric }} aria-hidden="true" />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

export function QuantityInput({
  value,
  onChange,
  label = "Quantité",
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
  compact?: boolean;
}) {
  const h = compact ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="inline-flex items-stretch border border-ink/25" role="group" aria-label={label}>
      <button
        type="button"
        className={`${h} text-lg leading-none hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Retirer un"
      >
        −
      </button>
      <output className={`${compact ? "w-8" : "w-12"} grid place-items-center font-mono text-sm`} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={`${h} text-lg leading-none hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink`}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label="Ajouter un"
      >
        +
      </button>
    </div>
  );
}
