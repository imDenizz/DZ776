import Link from "next/link";
import { BRAND, COLLECTION } from "@/config/brand";
import { formatPrice, getProducts } from "@/lib/catalog";
import { Rack } from "@/components/rack/Rack";
import { Footer } from "@/components/layout/Footer";
import { LineReveal, Reveal } from "@/components/ui/Reveal";
import { CollectionIndex } from "@/components/shop/CollectionIndex";

export default function HomePage() {
  const products = getProducts();
  return (
    <>
      <h1 className="sr-only">
        {BRAND.name} — {COLLECTION.full}
      </h1>
      <Rack />

      {/* ---- Présentation de la collection ---- */}
      <section className="bg-ink text-paper" aria-labelledby="collection-title">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Collection {COLLECTION.code}</p>
          <h2 id="collection-title" className="mt-4 font-display text-[clamp(4rem,15vw,13rem)] uppercase leading-[0.85]">
            <LineReveal onView lines={["Rien", <span key="t" className="text-militant">à taire.</span>]} />
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <Reveal>
              <p className="text-xl leading-relaxed md:text-2xl">
                Douze pièces. Douze phrases qu&apos;on refuse de garder pour nous. Des coupes larges, des tissus lourds, et des messages
                imprimés là où tout le monde peut les lire&nbsp;: <span className="text-militant">dans ton dos</span>.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col justify-between gap-8">
              <p className="text-paper/70">
                {BRAND.name} est un label streetwear né d&apos;un constat simple&nbsp;: l&apos;époque est sale, mais les résistances sont
                belles. Antiracisme, antifascisme, féminisme, égalité, solidarité — on les porte, on ne les négocie pas.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/shop" className="flex h-12 items-center bg-paper px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition hover:bg-militant hover:text-paper">
                  Toute la collection
                </Link>
                <Link href="/manifeste" className="flex h-12 items-center border border-paper/40 px-6 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:border-paper hover:bg-paper hover:text-ink">
                  Lire le manifeste
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
        <CollectionIndex products={products.map((p) => ({ ...p, priceLabel: formatPrice(p.price) }))} />
      </section>
      <Footer />
    </>
  );
}
