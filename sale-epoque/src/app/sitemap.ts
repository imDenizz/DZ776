import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { getProducts } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.siteUrl;
  return [
    { url: base, priority: 1 },
    { url: `${base}/shop`, priority: 0.9 },
    { url: `${base}/manifeste`, priority: 0.7 },
    { url: `${base}/contact`, priority: 0.5 },
    ...getProducts().map((p) => ({ url: `${base}/produit/${p.slug}`, priority: 0.8 })),
  ];
}
