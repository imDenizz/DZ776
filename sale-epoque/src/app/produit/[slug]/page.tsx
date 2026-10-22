import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/config/brand";
import { getAdjacent, getProduct, getProducts } from "@/lib/catalog";
import { Footer } from "@/components/layout/Footer";
import { ProductView } from "@/components/product/ProductView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Pièce introuvable" };
  return {
    title: `${p.name} — ${p.label}`,
    description: `${p.short} ${p.label} « ${p.slogan.lines.join(" ")} » imprimé dans le dos. ${p.price} €.`,
    alternates: { canonical: `/produit/${p.slug}` },
    openGraph: { title: `${p.name} — ${BRAND.name}`, description: p.short },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const { prev, next } = getAdjacent(slug);

  // Données structurées : produit, prix. Volontairement aucune note ni avis.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.label}`,
    description: product.description,
    brand: { "@type": "Brand", name: BRAND.name },
    sku: `SE-001-${product.number}`,
    color: product.colorways.map((c) => c.name).join(", "),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      url: `${BRAND.siteUrl}/produit/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductView product={product} prev={prev} next={next} />
      <Footer />
    </>
  );
}
