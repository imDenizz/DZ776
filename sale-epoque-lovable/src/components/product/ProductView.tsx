
import { AnimatePresence, motion } from "motion/react";
import Link, { usePathname, useRouter } from "@/lib/router";
import { useEffect, useState } from "react";
import type { Product, Size } from "@/data/products";
import { formatPrice, getColorway } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { FlipGarment } from "@/components/garment/FlipGarment";
import { usePreloadColorways } from "@/components/garment/usePreload";
import { Garment, type Side } from "@/components/garment/Garment";
import { SideToggle } from "@/components/garment/SideToggle";
import { MockupBadge } from "@/components/ui/MockupBadge";
import { ColorSelector, QuantityInput, SizeSelector } from "./Selectors";
import { SizeGuide } from "./SizeGuide";

type View = "front" | "back" | "print" | "logo";

/** Recadrages « photo de détail » dans le repère du vêtement. */
const DETAIL_BOX: Record<Product["type"], Record<"print" | "logo", string>> = {
  tshirt: { print: "88 96 224 300", logo: "196 62 112 112" },
  hoodie: { print: "96 186 208 250", logo: "200 104 112 112" },
};
/** Recadrages pour les visuels détourés (même repère, cadrage commun à toutes les pièces). */
const IMAGE_DETAIL_BOX: Record<"print" | "logo", string> = { print: "40 30 320 400", logo: "185 105 150 150" };

export function ProductView({ product, prev, next }: { product: Product; prev: Product; next: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const [cwId, setCwId] = useState(product.colorways[0].id);
  const [view, setView] = useState<View>("front");
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [guide, setGuide] = useState(false);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const colorway = getColorway(product, cwId);
  usePreloadColorways(product);

  // Coloris partagé via l'URL (?coloris=…) — lu côté client pour garder la page statique.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("coloris");
    if (fromUrl) setCwId(getColorway(product, fromUrl).id);
  }, [product]);
  const side: Side = view === "back" || view === "print" ? "back" : "front";
  const isDetail = view === "print" || view === "logo";
  const detailBox = colorway.image ? IMAGE_DETAIL_BOX : DETAIL_BOX[product.type];

  const changeColor = (id: string) => {
    setCwId(id);
    router.replace(`${pathname}?coloris=${id}`, { scroll: false });
  };

  const addToCart = () => {
    if (!size) {
      setError(true);
      document.getElementById("size-label")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({ slug: product.slug, colorwayId: colorway.id, size, qty });
    openCart();
  };

  const views: { id: View; label: string }[] = [
    { id: "front", label: "Devant" },
    { id: "back", label: "Dos" },
    { id: "print", label: "Détail print" },
    // Le zoom logo n'a de sens qu'avec un visuel net (dessin vectoriel ou visuel HD).
    ...(colorway.image && !colorway.image.hd ? [] : [{ id: "logo" as const, label: "Détail logo" }]),
  ];

  return (
    <article className="pt-[var(--header-h)]">
      <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* ---- Galerie ---- */}
        <div className="md:sticky md:top-[var(--header-h)] md:h-[calc(100svh-var(--header-h)-var(--marquee-h))]">
          <div className="wall relative flex h-[72svh] flex-col md:h-full">
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {isDetail ? (
                  <motion.div
                    key={`${view}-${colorway.id}`}
                    className="absolute inset-0 flex items-center justify-center p-6"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Garment
                      product={product}
                      colorway={colorway}
                      side={side}
                      viewBox={detailBox[view]}
                      className="h-full max-h-[80%] w-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="flip"
                    className="absolute inset-0 flex items-center justify-center pb-4 pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 60) setView(side === "front" ? "back" : "front");
                    }}
                    style={{ touchAction: "pan-y" }}
                  >
                    <FlipGarment product={product} colorway={colorway} side={side} rail className="h-full max-h-[680px]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute left-4 top-4">
                <MockupBadge />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
              <SideToggle value={side} onChange={(s) => setView(s)} size="lg" />
              <div role="group" aria-label="Vues du produit" className="flex gap-1.5">
                {views.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setView(v.id)}
                    aria-pressed={view === v.id}
                    aria-label={v.label}
                    className={`h-14 w-12 overflow-hidden border bg-paper/60 transition ${view === v.id ? "border-ink" : "border-ink/15 hover:border-ink/50"}`}
                  >
                    <Garment
                      product={product}
                      colorway={colorway}
                      side={v.id === "front" || v.id === "logo" ? "front" : "back"}
                      lite
                      decorative
                      viewBox={v.id === "front" || v.id === "back" ? "0 0 400 480" : detailBox[v.id]}
                      className="h-full w-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Infos ---- */}
        <div className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-14">
          <nav aria-label="Fil d'Ariane" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
            <Link href="/shop" className="hover:text-ink">
              Shop
            </Link>{" "}
            / <span aria-current="page">N°{product.number}</span>
          </nav>
          <motion.h1
            className="mt-4 font-display text-[clamp(3.5rem,8vw,7rem)] uppercase leading-[0.85]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {product.name}
          </motion.h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">
            {product.label} — « {product.slogan.lines.join(" ")} »
          </p>
          <p className="mt-6 font-display text-4xl">{formatPrice(product.price)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">TTC — prix de prototype</p>

          <p className="mt-6 max-w-prose text-lg leading-relaxed">{product.short}</p>

          <div className="mt-8 space-y-7">
            <div>
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
                Coloris — <span className="text-ink/60">{colorway.name}</span>
              </p>
              <ColorSelector colorways={product.colorways} value={colorway.id} onChange={changeColor} />
            </div>

            <div>
              <div className="mb-2.5 flex items-baseline justify-between">
                <p id="size-label" className="font-mono text-[11px] uppercase tracking-[0.2em]">
                  Taille {size && <span className="text-ink/60">— {size}</span>}
                </p>
                <button type="button" onClick={() => setGuide(true)} className="font-mono text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 hover:text-militant">
                  Guide des tailles
                </button>
              </div>
              <SizeSelector
                sizes={product.sizes}
                value={size}
                onChange={(s) => {
                  setSize(s);
                  setError(false);
                }}
                invalid={error}
                describedBy={error ? "size-error" : undefined}
              />
              {error && (
                <p id="size-error" role="alert" className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-militant">
                  Choisis une taille avant d&apos;ajouter au panier.
                </p>
              )}
            </div>

            <div className="flex items-stretch gap-3">
              <QuantityInput value={qty} onChange={setQty} />
              <button
                type="button"
                onClick={addToCart}
                className="flex h-11 flex-1 items-center justify-between bg-ink px-5 font-display text-lg uppercase tracking-wide text-paper transition-colors hover:bg-militant"
              >
                <span>Ajouter au panier</span>
                <span>{formatPrice(product.price * qty)}</span>
              </button>
            </div>
          </div>

          <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
            <Disclosure title="Description" defaultOpen>
              <p className="leading-relaxed">{product.description}</p>
            </Disclosure>
            <Disclosure title="Détails & matière">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">Spécifications visées pour la production</p>
              <ul className="list-inside list-[square] space-y-1">
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Disclosure>
            <Disclosure title="Entretien">
              <p>Lavage à 30 °C, sur l&apos;envers. Pas de sèche-linge, pas de repassage sur l&apos;impression. Le print vieillit avec toi.</p>
            </Disclosure>
            <Disclosure title="Livraison & retours">
              <p>
                Le paiement en ligne n&apos;est pas encore ouvert. Les conditions de livraison et de retour seront détaillées dans{" "}
                <Link href="/infos/retours" className="underline underline-offset-4 hover:text-militant">
                  Retours & échanges
                </Link>
                .
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      {/* ---- Navigation entre pièces ---- */}
      <nav aria-label="Autres pièces" className="grid border-t border-ink md:grid-cols-2">
        {[
          { p: prev, dir: "← Pièce précédente" },
          { p: next, dir: "Pièce suivante →" },
        ].map(({ p, dir }, i) => (
          <Link
            key={dir}
            href={`/produit/${p.slug}`}
            className={`group flex items-center justify-between gap-6 overflow-hidden px-4 py-8 transition-colors hover:bg-ink hover:text-paper md:px-8 ${i === 0 ? "md:border-r md:border-ink" : "border-t border-ink md:border-t-0 md:flex-row-reverse md:text-right"}`}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{dir}</p>
              <p className="mt-2 font-display text-4xl uppercase md:text-5xl">{p.name}</p>
            </div>
            <Garment product={p} colorway={p.colorways[0]} side="back" lite decorative viewBox="0 0 400 480" className="h-24 w-20 shrink-0 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
          </Link>
        ))}
      </nav>

      <SizeGuide open={guide} onClose={() => setGuide(false)} type={product.type} />
    </article>
  );
}

function Disclosure({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-mono text-[11px] uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-5 text-sm text-ink/80">{children}</div>
    </details>
  );
}
