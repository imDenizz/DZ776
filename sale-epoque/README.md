# SALE ÉPOQUE — boutique streetwear (prototype)

Site e-commerce de la **COLLECTION 001 — RIEN À TAIRE**.
L'accueil est un **portant interactif** inspiré de la vidéo de référence. On survole les pièces, on en décroche une, on la retourne (FRONT / BACK), on choisit coloris et taille, puis on l'ajoute au panier sans quitter le portant.

> ⚠️ Prototype : les visuels sont des **maquettes vectorielles** (signalées comme telles sur le site), les prix sont fictifs et le **paiement n'est pas activé**. Aucune commande n'est simulée ni enregistrée.

## Lancer en local

Il faut Node.js 20.9 ou plus récent (testé avec Node 22).

```bash
cd sale-epoque
npm install
npm run dev        # http://localhost:3000
```

En production :

```bash
npm run build
npm start
```

`npm run lint` lance la vérification TypeScript.

## Déployer

**Vercel (recommandé)**
1. Importer le dépôt sur vercel.com et choisir `sale-epoque` comme *Root Directory*.
2. Ajouter la variable `NEXT_PUBLIC_SITE_URL=https://ton-domaine.fr`, utilisée pour le SEO, le sitemap et Open Graph.
3. Déployer. Le framework Next.js est détecté automatiquement.

**Autre hébergeur Node** : `npm run build && npm start`, avec `PORT` pour changer le port.

## Architecture

```
src/
├─ config/brand.ts        ← nom de la marque, slogan, e-mail, réseaux, bandeau défilant
├─ config/nav.ts          ← liens du menu
├─ data/products.ts       ← catalogue (6 produits, coloris, tailles, guide des tailles)
├─ data/legal.ts          ← trame des pages légales (à compléter)
├─ lib/catalog.ts         ← accès au catalogue (point de branchement Shopify)
├─ lib/cart-store.ts      ← panier (Zustand + localStorage)
├─ components/
│  ├─ garment/            ← rendu SVG des vêtements, rotation FRONT/BACK, étiquettes coloris
│  ├─ rack/               ← LE PORTANT (Rack) + scène produit (RackStage)
│  ├─ product/            ← fiche produit, sélecteurs, guide des tailles
│  ├─ shop/               ← grille filtrable, cartes, index de collection
│  └─ layout/             ← header + menu, panier latéral, bandeau, footer
└─ app/                   ← pages (App Router) + /api/checkout
```

| Page | Route |
|---|---|
| Accueil / portant | `/` |
| Shop (filtres + tri dans l'URL) | `/shop?type=hoodie&tri=price-asc` |
| Fiche produit | `/produit/[slug]?coloris=…` |
| Manifeste | `/manifeste` |
| Contact + FAQ | `/contact` |
| Mentions légales, confidentialité, retours, CGV | `/infos/[slug]` |

### Le portant (`components/rack`)
- **Desktop** : les 10 cintres (6 modèles, un cintre par coloris) tiennent sur une tringle. Au survol ou au focus clavier, la pièce avance et se balance, et ses voisines s'écartent. Les flèches ← → ou les boutons permettent de naviguer.
- **Clic** : la pièce quitte la tringle et vient au centre grâce à un `layoutId` partagé (Motion). Le portant passe en flou derrière. La scène contient FRONT / BACK, les étiquettes de coloris (changement par balayage), les tailles, l'ajout au panier et un lien vers la fiche complète. ← → change de pièce, Échap ramène au portant.
- **Mobile** : défilement tactile avec aimantation (scroll-snap). La pièce centrée est mise en avant, et dans la scène on glisse le vêtement pour passer à la suivante.

### Pourquoi du SVG et pas Three.js
Les pièces sont des visuels plats (comme les photos détourées de la référence). Une rotation CSS 3D avec perspective donne un retournement fluide, avec un cintre qui reste fixe. C'est bien plus léger qu'une scène WebGL, et ça marche sur tous les téléphones. Pour passer aux photos, il suffit de remplacer `<Garment>` par des `<Image>` (devant / dos) dans `FlipGarment`.

## Modifier facilement

- **Nom de la marque** : `src/config/brand.ts` → `name` et `wordmark`. Le changement se répercute sur le logo, le print poitrine des maquettes, le SEO et le footer.
- **Produits** : `src/data/products.ts` (slogan ligne par ligne, lignes en rouge via `accent`, coloris, prix).
- **Ordre des cintres** : `getRackItems()` dans `src/lib/catalog.ts`.
- **Réseaux sociaux** : renseigner `href` dans `brand.ts`. Tant que c'est vide, le site affiche « bientôt » au lieu d'un faux lien.
- **E-mail de contact** : `contactEmail` dans `brand.ts`. Le formulaire ouvre la messagerie avec le message pré-rempli.

## Paiement — intégration future

`POST /api/checkout` revalide déjà le panier côté serveur : produits, coloris, tailles, quantités et prix recalculés. Tant que `STRIPE_SECRET_KEY` est vide, la route répond **501** et le panier affiche un message clair. La marche à suivre pour **Stripe Checkout** et **Shopify Storefront** (`cartCreate` → `checkoutUrl`) est commentée dans `src/app/api/checkout/route.ts`.

## Accessibilité et performances
- Navigation complète au clavier : portant (← →, Entrée), scène (Échap), menu, panier et guide des tailles avec focus piégé puis restitué.
- `prefers-reduced-motion` est respecté : `MotionConfig reducedMotion="user"`, et le bandeau, les balancements et les rotations CSS sont coupés.
- Pages statiques (SSG) et métadonnées par produit. Le JSON-LD `Product` ne contient volontairement **aucun avis ni note**. `sitemap.xml` et `robots.txt` sont générés.
- Aucune image à télécharger : les vêtements sont en SVG. Les polices sont auto-hébergées via Fontsource : Anton, Space Grotesk, Space Mono.

## À faire avant l'ouverture
- [ ] Photos réelles (devant / dos / détails) à la place des maquettes
- [ ] Textes légaux (`src/data/legal.ts`) relus par un·e juriste
- [ ] Branchement Stripe ou Shopify, page de confirmation de commande
- [ ] Vrais comptes réseaux et adresse e-mail
