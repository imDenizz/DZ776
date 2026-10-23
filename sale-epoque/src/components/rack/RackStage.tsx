"use client";

/**
 * Scène produit ouverte depuis le portant, sans quitter la page :
 * la pièce vient au premier plan, le portant recule derrière un voile flou.
 *
 * Chorégraphie (recette « ouverture de modale » du skill) :
 *  voile 200 ms → la pièce (héros) est portée au centre → le contenu suit 100 ms après son arrivée,
 *  en cascade de 60 ms (identité, étiquettes, interrupteur, achat) → la croix de fermeture en dernier.
 *  À la fermeture, le contenu part d'abord (accélération, plus court), puis la pièce rejoint la tringle.
 * FRONT/BACK, coloris (étiquettes), taille, ajout au panier, navigation ← →, glisser sur mobile.
 */
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { DUR, SPRING, STAGGER, enter, leave } from "@/lib/motion";
import { AddToCartButton, Shake } from "@/components/ui/Feedback";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Size } from "@/data/products";
import { formatPrice, getColorway, type RackItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { FlipGarment } from "@/components/garment/FlipGarment";
import { usePreloadColorways } from "@/components/garment/usePreload";
import { HangTags } from "@/components/garment/HangTags";
import { SideToggle } from "@/components/garment/SideToggle";
import type { Side } from "@/components/garment/Garment";
import { SizeSelector } from "@/components/product/Selectors";
import { MockupBadge } from "@/components/ui/MockupBadge";

type Props = {
  items: RackItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export function RackStage({ items, index, onIndex, onClose }: Props) {
  const n = items.length;
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cartOpen = useCart((s) => s.isOpen);
  useScrollLock(true);
  useFocusTrap(ref, !cartOpen, closeRef);

  const go = useCallback((dir: number) => onIndex((index + dir + n) % n), [index, n, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cartOpen || e.defaultPrevented) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, cartOpen]);

  const prev = items[(index - 1 + n) % n];
  const next = items[(index + 1) % n];

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${items[index].product.name} — aperçu`}
      className="fixed inset-0 z-40 flex flex-col"
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-paper/45 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: enter(0.2) }}
        exit={{ opacity: 0, transition: leave(DUR.slow) }}
        aria-hidden="true"
      />

      <motion.div
        className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-[calc(var(--header-h)+0.5rem)] md:px-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: enter(DUR.standard, 0.45) }}
        exit={{ opacity: 0, transition: leave(DUR.quick) }}
      >
        <p className="font-mono text-xs tracking-[0.25em]" aria-live="polite">
          <span className="text-militant">{String(index + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex h-11 items-center gap-3 rounded-full border border-ink bg-paper/70 px-4 font-mono text-[11px] uppercase tracking-[0.2em] backdrop-blur transition hover:bg-ink hover:text-paper"
        >
          Retour au portant <span aria-hidden="true">✕</span>
        </button>
      </motion.div>

      {/* Flèches latérales (desktop) */}
      <NavArrow dir={-1} label={`Précédent : ${prev.product.name}`} onClick={() => go(-1)} />
      <NavArrow dir={1} label={`Suivant : ${next.product.name}`} onClick={() => go(1)} />

      <StageContent key={index} item={items[index]} index={index} onSwipe={go} />
    </motion.div>
  );
}

function StageContent({ item, index, onSwipe }: { item: RackItem; index: number; onSwipe: (d: number) => void }) {
  const { product } = item;
  const reduce = useReducedMotion();
  const [side, setSide] = useState<Side>("front");
  const [cwId, setCwId] = useState(item.colorway.id);
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const colorway = getColorway(product, cwId);
  usePreloadColorways(product);

  const addToCart = () => {
    if (!size) {
      setError(true);
      setShake((n) => n + 1);
      return false;
    }
    add({ slug: product.slug, colorwayId: colorway.id, size, qty: 1 });
    // Le succès s'affiche sur le bouton, puis le panier s'ouvre (le regard suit l'article).
    setTimeout(openCart, 450);
    return true;
  };

  // Le contenu arrive 100 ms après la pièce, en cascade de 60 ms (ordre de lecture).
  const fade = (step = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0, transition: enter(DUR.slow, reduce ? 0 : 0.3 + step * STAGGER.standard) },
    exit: { opacity: 0, y: reduce ? 0 : 8, transition: leave(DUR.standard) },
  });

  return (
    <div className="pointer-events-none relative z-10 flex flex-1 flex-col overflow-y-auto pb-[calc(var(--marquee-h)+1rem)] md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6 md:overflow-hidden md:px-24 lg:gap-10">
      {/* Gauche : identité de la pièce (desktop) */}
      <motion.div {...fade(0)} className="pointer-events-auto hidden justify-self-end text-right md:block md:max-w-xs">
        <p className="font-mono text-xs tracking-[0.25em] text-militant">N°{product.number}</p>
        <h2 className="mt-2 font-display text-5xl uppercase leading-[0.9] lg:text-7xl">{product.name}</h2>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">
          {product.label} — {colorway.name}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-ink/80">{product.short}</p>
        <p className="mt-5 font-display text-3xl">{formatPrice(product.price)}</p>
      </motion.div>

      {/* Centre : la pièce */}
      <div className="pointer-events-auto flex flex-col items-center px-4 pt-2 md:px-0">
        <div className="relative flex items-start">
          <motion.div
            layoutId={`rack-garment-${index}`}
            transition={SPRING.carry}
            className="aspect-[400/550] h-[min(46svh,420px)] md:h-[min(60svh,620px)]"
          >
            <motion.div
              className="h-full w-full touch-pan-y"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -500) onSwipe(1);
                else if (info.offset.x > 70 || info.velocity.x > 500) onSwipe(-1);
              }}
            >
              <FlipGarment product={product} colorway={colorway} side={side} className="h-full w-full" />
            </motion.div>
          </motion.div>
          <motion.div {...fade(2)} className="absolute left-full top-[6%] ml-1 md:ml-3">
            <HangTags colorways={product.colorways} value={colorway.id} onChange={setCwId} />
          </motion.div>
        </div>

        <motion.div {...fade(1)} className="mt-2 flex flex-col items-center gap-2">
          <h2 className="text-center font-display text-3xl uppercase leading-none md:hidden">{product.name}</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 md:hidden">
            {product.label} — {colorway.name} — {formatPrice(product.price)}
          </p>
          <SideToggle value={side} onChange={setSide} />
          {product.visual === "maquette" && <MockupBadge />}
        </motion.div>
      </div>

      {/* Droite : achat rapide */}
      <motion.div {...fade(3)} className="pointer-events-auto mx-auto mt-5 w-full max-w-sm px-4 md:mt-0 md:justify-self-start md:px-0">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Taille</p>
          {error && (
            <motion.p
              id="stage-size-error"
              role="alert"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-militant"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: enter(DUR.quick) }}
            >
              Choisis une taille
            </motion.p>
          )}
        </div>
        <Shake trigger={shake} className="mt-2">
          <SizeSelector
            sizes={product.sizes}
            value={size}
            onChange={(s) => {
              setSize(s);
              setError(false);
            }}
            invalid={error}
            describedBy={error ? "stage-size-error" : undefined}
          />
        </Shake>
        <AddToCartButton label="Ajouter au panier" price={formatPrice(product.price)} onAdd={addToCart} className="mt-3 h-14 w-full" />
        <Link
          href={`/produit/${product.slug}?coloris=${colorway.id}`}
          className="mt-3 flex h-12 w-full items-center justify-center border border-ink font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-ink hover:text-paper"
        >
          Fiche complète ↗
        </Link>
        <p className="mt-4 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 md:block">← → pour changer de pièce · Échap pour revenir</p>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 md:hidden">Glisse la pièce pour passer à la suivante</p>
      </motion.div>
    </div>
  );
}

function NavArrow({ dir, label, onClick }: { dir: 1 | -1; label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      initial={{ opacity: 0, x: dir * 20 }}
      animate={{ opacity: 1, x: 0, transition: enter(DUR.standard, 0.5) }}
      exit={{ opacity: 0, x: dir * 12, transition: leave(DUR.quick) }}
      whileHover={{ x: dir * 4, transition: { duration: DUR.micro } }}
      whileTap={{ scale: 0.94, transition: { duration: DUR.micro } }}
      className={`group absolute top-1/2 z-20 hidden h-16 w-16 -translate-y-1/2 place-items-center rounded-full border border-ink/30 bg-paper/60 text-2xl backdrop-blur transition hover:bg-ink hover:text-paper md:grid ${
        dir < 0 ? "left-6" : "right-6"
      }`}
    >
      {dir < 0 ? "←" : "→"}
    </motion.button>
  );
}
