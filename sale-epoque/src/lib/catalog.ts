/**
 * Couche d'accès au catalogue.
 * Aujourd'hui : données statiques. Demain : Shopify Storefront API ou Stripe Products,
 * sans toucher aux composants.
 */
import { PRODUCTS, type Colorway, type Product } from "@/data/products";

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getColorway(product: Product, colorwayId?: string): Colorway {
  return product.colorways.find((c) => c.id === colorwayId) ?? product.colorways[0];
}

export function getAdjacent(slug: string): { prev: Product; next: Product } {
  const i = PRODUCTS.findIndex((p) => p.slug === slug);
  const n = PRODUCTS.length;
  return { prev: PRODUCTS[(i - 1 + n) % n], next: PRODUCTS[(i + 1) % n] };
}

export type RackItem = { product: Product; colorway: Colorway };

/** Ordre d'accrochage sur le portant : chaque coloris est un cintre. */
export function getRackItems(): RackItem[] {
  const order: [string, string][] = [
    ["sale-epoque", "blanc-casse"],
    ["no-pasaran", "noir"],
    ["human-first", "noir"],
    ["pas-dociles", "anthracite"],
    ["egalite-radicale", "rouge-sombre"],
    ["contre-ordre", "noir-delave"],
    ["human-first", "blanc-casse"],
    ["no-pasaran", "anthracite"],
    ["sale-epoque", "noir"],
    ["pas-dociles", "noir"],
  ];
  return order.flatMap(([slug, cw]) => {
    const product = getProduct(slug);
    return product ? [{ product, colorway: getColorway(product, cw) }] : [];
  });
}

export const formatPrice = (euros: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: euros % 1 ? 2 : 0 }).format(euros);
