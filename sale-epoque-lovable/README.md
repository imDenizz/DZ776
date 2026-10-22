# SALE ÉPOQUE — version Lovable (Vite + React)

Même site que `../sale-epoque` (Next.js), porté sur la stack de Lovable : **Vite, React, TypeScript, Tailwind CSS, React Router**.
Portant interactif, FRONT/BACK, coloris, panier, shop, fiches produit, manifeste, contact et pages d'infos sont identiques.

> Prototype : visuels de présentation, prix fictifs, **paiement non activé** (aucune commande n'est simulée ni encaissée).

## Lancer

```bash
npm install
npm run dev       # http://localhost:8080
npm run build     # build de production dans dist/
```

## Différences avec la version Next.js

| Next.js | Ici |
|---|---|
| App Router (`src/app`) | React Router (`src/App.tsx`, pages dans `src/pages`) |
| `next/link`, `next/navigation` | `src/lib/router.tsx` (même API : `href`, `usePathname`…) |
| Métadonnées serveur | `useSeo()` (`src/lib/seo.ts`) met à jour titre et description |
| Route `/api/checkout` | `startCheckout()` (`src/lib/checkout.ts`), côté navigateur |
| `NEXT_PUBLIC_SITE_URL` | `VITE_SITE_URL` (facultatif) |

## Paiement

`src/lib/checkout.ts` revalide le panier puis refuse poliment tant qu'aucun prestataire n'est branché.
Avec Lovable : activer **Supabase**, créer une Edge Function qui crée la session **Stripe Checkout** (clé secrète côté serveur, prix recalculés côté serveur), puis l'appeler depuis `startCheckout()` — la marche à suivre est commentée dans le fichier.

## Modifier

- Nom de la marque, slogan, réseaux, bandeau : `src/config/brand.ts`
- Produits, coloris, prix : `src/data/products.ts`
- Ordre des cintres : `getRackItems()` dans `src/lib/catalog.ts`
- Visuels : `public/products/<slug>[-<coloris>]-front|back.webp` (scripts de découpe et de recoloriage dans `scripts/`)
