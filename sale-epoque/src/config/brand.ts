/**
 * Identité de la marque — point unique de configuration.
 * Changer le nom ici le change partout (logo, prints sur les maquettes, SEO, mentions).
 */
export const BRAND = {
  name: "SALE ÉPOQUE",
  /** Le nom découpé pour le logo empilé et le petit print poitrine. */
  wordmark: ["SALE", "ÉPOQUE"] as const,
  tagline: "Rien à taire.",
  description:
    "Label streetwear underground. T-shirts et hoodies oversize, messages imprimés dans le dos. Antiraciste, antifasciste, féministe, solidaire.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr_FR",
  currency: "EUR",
  /** Adresse utilisée par le formulaire de contact (mailto). À remplacer. */
  contactEmail: "contact@sale-epoque.fr",
  /**
   * Réseaux sociaux. Laisser `href` vide tant que le compte n'existe pas :
   * le lien s'affiche alors comme « bientôt » au lieu de pointer vers un compte inconnu.
   */
  socials: [
    { label: "Instagram", handle: "@saleepoque", href: "" },
    { label: "TikTok", handle: "@saleepoque", href: "" },
    { label: "Bluesky", handle: "@saleepoque", href: "" },
  ],
  marquee: [
    "NO PASARÁN",
    "HUMAN RIGHTS FOR ALL",
    "RIEN À TAIRE",
    "SALE ÉPOQUE",
    "SOLIDARITÉ TOUJOURS",
    "NO HUMAN IS ILLEGAL",
    "COLLECTION 001",
  ],
} as const;

export const COLLECTION = {
  code: "001",
  name: "RIEN À TAIRE",
  full: "COLLECTION 001 — RIEN À TAIRE",
} as const;
