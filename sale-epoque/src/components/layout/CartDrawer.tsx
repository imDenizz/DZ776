"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { formatPrice, getColorway, getProduct } from "@/lib/catalog";
import { cartCount, lineKey, useCart } from "@/lib/cart-store";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { Garment } from "@/components/garment/Garment";
import { QuantityInput } from "@/components/product/Selectors";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  return <AnimatePresence>{isOpen && <Drawer />}</AnimatePresence>;
}

type CheckoutState = { status: "idle" } | { status: "loading" } | { status: "error"; message: string };

function Drawer() {
  const { lines, close, setQty, remove } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [checkout, setCheckout] = useState<CheckoutState>({ status: "idle" });
  useScrollLock(true);
  useEscape(true, close);
  useFocusTrap(ref, true, closeRef);

  // Lignes dont le produit n'existe plus (catalogue modifié) : ignorées et signalées.
  const resolved = lines.map((l) => {
    const product = getProduct(l.slug);
    return { line: l, product, colorway: product ? getColorway(product, l.colorwayId) : undefined };
  });
  const valid = resolved.filter((r) => r.product);
  const stale = resolved.length - valid.length;
  const total = valid.reduce((sum, r) => sum + r.product!.price * r.line.qty, 0);
  const count = cartCount(valid.map((r) => r.line));

  const submit = async () => {
    setCheckout({ status: "loading" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: valid.map((r) => r.line) }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setCheckout({ status: "error", message: data.message ?? "Le paiement est indisponible pour le moment." });
    } catch {
      setCheckout({ status: "error", message: "Connexion impossible. Vérifie ta connexion et réessaie." });
    }
  };

  return (
    <div className="fixed inset-0 z-[65]">
      <motion.div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-hidden="true"
      />
      <motion.aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper pb-[var(--marquee-h)] shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        <div className="flex items-center justify-between border-b border-ink px-5 py-4">
          <h2 id="cart-title" className="font-display text-3xl uppercase">
            Panier <span className="text-militant">({count})</span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="flex h-11 items-center gap-2 rounded-full border border-ink px-4 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-paper"
          >
            Fermer <span aria-hidden="true">✕</span>
          </button>
        </div>

        {valid.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-display text-5xl uppercase leading-[0.9]">
              Rien
              <br />à porter
              <br />
              <span className="text-militant">pour l&apos;instant.</span>
            </p>
            <p className="text-sm text-ink/70">Ton panier est vide. Passe voir le portant.</p>
            <Link
              href="/shop"
              onClick={close}
              className="flex h-12 items-center bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-militant"
            >
              Voir la collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/15 overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {valid.map(({ line, product, colorway }) => {
                  const key = lineKey(line);
                  return (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      className="flex gap-4 overflow-hidden py-4"
                    >
                      <Link href={`/produit/${product!.slug}?coloris=${colorway!.id}`} onClick={close} className="w-20 shrink-0 bg-wall">
                        <Garment product={product!} colorway={colorway!} lite decorative className="h-full w-full" viewBox="0 0 400 480" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-display text-xl uppercase leading-none">{product!.name}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">
                              {product!.label} — {colorway!.name} — {line.size}
                            </p>
                          </div>
                          <p className="font-mono text-sm">{formatPrice(product!.price * line.qty)}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityInput compact value={line.qty} onChange={(q) => setQty(key, q)} label={`Quantité ${product!.name}`} />
                          <button
                            type="button"
                            onClick={() => remove(key)}
                            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 underline underline-offset-4 hover:text-militant"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="border-t border-ink px-5 py-5">
              {stale > 0 && (
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-militant">
                  {stale} article{stale > 1 ? "s" : ""} retiré{stale > 1 ? "s" : ""} du catalogue ignoré{stale > 1 ? "s" : ""}.
                </p>
              )}
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Sous-total TTC</p>
                <p className="font-display text-3xl">{formatPrice(total)}</p>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink/50">Livraison calculée à l&apos;étape de paiement.</p>
              <button
                type="button"
                onClick={submit}
                disabled={checkout.status === "loading"}
                className="mt-4 flex h-14 w-full items-center justify-center bg-ink font-display text-lg uppercase tracking-wide text-paper transition-colors hover:bg-militant disabled:opacity-60"
              >
                {checkout.status === "loading" ? "Connexion…" : "Commander"}
              </button>
              <AnimatePresence>
                {checkout.status === "error" && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 border-l-2 border-militant pl-3 text-sm text-ink/80"
                  >
                    {checkout.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>
    </div>
  );
}
