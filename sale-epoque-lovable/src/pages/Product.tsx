import { useParams } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import NotFound from "./NotFound";
import { BRAND } from "@/config/brand";
import { getAdjacent, getProduct } from "@/lib/catalog";
import { Footer } from "@/components/layout/Footer";
import { ProductView } from "@/components/product/ProductView";

export default function ProductPage() {
  const slug = useParams().slug ?? "";
  const product = getProduct(slug);
  useSeo({
    title: product ? `${product.name} — ${product.label}` : "Pièce introuvable",
    description: product
      ? `${product.short} ${product.label} « ${product.slogan.lines.join(" ")} » imprimé dans le dos. ${product.price} €.`
      : undefined,
    noindex: !product,
  });
  if (!product) return <NotFound />;
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
      <ProductView key={product.slug} product={product} prev={prev} next={next} />
      <Footer />
    </>
  );
}
