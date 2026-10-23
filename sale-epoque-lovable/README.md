# SALE ÉPOQUE — version Lovable (Vite + React)

Même site que `../sale-epoque` (Next.js), porté sur la stack de Lovable : **Vite, React, TypeScript, Tailwind CSS, React Router**.
Portant interactif, FRONT/BACK, coloris, panier, shop, fiches produit, manifeste, contact et pages d'infos sont identiques.

> Prototype : visuels de présentation, prix fictifs, **paiement non activé** (aucune commande n'est simulée ni encaissée).

## Synchroniser avec la version Next.js

Le code partagé (composants, données, mouvement, styles) vient de `../sale-epoque`. Après une modification là-bas :

```bash
python3 scripts/sync-from-next.py
```

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

## Système de mouvement

Les animations suivent le skill **motion-design** (`.claude/skills/motion-design`). Toutes les valeurs sont dans `src/lib/motion.ts` : aucune durée ni courbe n'est écrite en dur dans les composants.

| | Choix |
|---|---|
| Personnalité | **Énergique** pour l'interface (affiche punk, gestes francs), emprunt **Premium** pour les vêtements |
| Matières | métal (cintre, tringle) : rigide, sans rebond · tissu lourd : amorti, dépassement < 5 % |
| Courbe signature | ease-out-expo `(0.16, 1, 0.3, 1)` pour 80 % des animations ; sorties en ease-in, mouvements à l'écran en ease-in-out |
| Durées | 90 ms (survol) · 180 · 300 · 500 · 800 ms (grands titres, retournement) ; sorties ≈ 65 % des entrées ; mobile × 0,8 |
| Entrée type | « affiche collée » : monte de 24 px, sans rebond |
| Cascades | toujours < 500 ms au total |

Moments clés :
- **Arrivée sur le portant** : la tringle se trace depuis le centre, puis les pièces tombent dessus du centre vers les bords, et la légende arrive en dernier.
- **Survol d'une pièce** : la pièce s'avance (primaire), son ombre s'agrandit sur le mur et ses voisines s'écartent (secondaire), puis le tissu oscille et se pose (suite).
- **Pièce décrochée** : le voile se pose en 200 ms, la pièce est portée au centre, puis le contenu suit en cascade de 60 ms.
- **FRONT / BACK** : anticipation de 12°, demi-tour, dépassement de 8° (poids du tissu), et l'ombre au sol se resserre de profil.
- **Ajout au panier** : pression à 98 %, « ✓ Ajouté » qui claque, puis le panier s'ouvre. Sans taille choisie, le sélecteur fait une secousse ferme de 360 ms.
- **Ambiance** : balancement sinusoïdal des cintres (durées décalées) et affiche murale qui suit le curseur à 0,2×.
- **Accessibilité** : avec « mouvement réduit », il ne reste que des fondus. Le bandeau défilant se met en pause au survol, et son bouton ⏸ arrête toutes les animations d'ambiance.

## Modifier

- Nom de la marque, slogan, réseaux, bandeau : `src/config/brand.ts`
- Produits, coloris, prix : `src/data/products.ts`
- Ordre des cintres : `getRackItems()` dans `src/lib/catalog.ts`
- Visuels : `public/products/<slug>[-<coloris>]-front|back.webp` (scripts de découpe et de recoloriage dans `scripts/`)
