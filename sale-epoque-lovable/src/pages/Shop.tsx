import { useSeo } from "@/lib/seo";
import { COLLECTION } from "@/config/brand";
import { getProducts } from "@/lib/catalog";
import { Footer } from "@/components/layout/Footer";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { LineReveal } from "@/components/ui/Reveal";

export default function ShopPage() {
  useSeo({
  title: "Shop",
  description: `${COLLECTION.full} : hoodies et t-shirts oversize, messages engagés imprimés dans le dos.`,
  });
  return (
    <>
      <section className="px-4 pb-24 pt-[calc(var(--header-h)+3rem)] md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">{COLLECTION.full}</p>
          <h1 className="mt-3 font-display text-[clamp(4.5rem,16vw,12rem)] uppercase leading-[0.82]">
            <LineReveal lines={["Le shop"]} />
          </h1>
          <ShopGrid products={getProducts()} />
        </div>
      </section>
      <Footer />
    </>
  );
}
