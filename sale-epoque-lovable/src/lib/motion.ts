/**
 * SYSTÈME DE MOUVEMENT — SALE ÉPOQUE
 *
 * Construit avec le skill motion-design (LottieFiles), en trois piliers :
 *  - Intention émotionnelle : détermination, aplomb. Rien de mou, rien de mignon.
 *  - Récit : chaque interaction a un « avant / action / retombée » (anticipation → geste → tissu qui se pose).
 *  - Artisanat : deux matières seulement, le métal (cintre, tringle : rigide, aucun rebond)
 *    et le tissu lourd (vêtements : amorti, léger balancier, jamais élastique).
 *
 * Personnalité : ÉNERGIQUE (affiche punk, coups francs) pour l'interface,
 * avec un emprunt PREMIUM pour les vêtements (90 % / 10 % — le tissu reste noble).
 *
 * Identité de marque (3 constantes) :
 *  1. Courbe signature : ease-out-expo → 80 % des animations.
 *  2. Palette de durées : rapide 180 ms / standard 300 ms / lent 500 ms (+ « drame » 800 ms pour les grands titres).
 *  3. Entrée type : « affiche collée » — monte de 24 px depuis un cache, sans rebond.
 *
 * Règles appliquées partout :
 *  - entrée = décélération (EASE.out), sortie = accélération (EASE.in), mouvement à l'écran = EASE.inOut ;
 *  - sorties ~35 % plus courtes que les entrées ;
 *  - stagger total < 500 ms ; au plus 1/3 des éléments en mouvement en même temps ;
 *  - jamais de linéaire sur un déplacement (sauf le bandeau défilant, qui est un téléscripteur) ;
 *  - mobile : durées × 0,8 ; mouvement réduit : opacité seule, durées divisées par deux.
 */

/** Courbes (cubic-bezier) — mêmes valeurs côté CSS dans globals.css (--ease-*). */
export const EASE = {
  /** Signature : entrée, réponse franche qui se pose doucement. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Sortie : part doucement puis file. */
  in: [0.7, 0, 0.84, 0] as const,
  /** Déplacement à l'écran (rotation FRONT/BACK, glissements). */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Ambiance (balancement, respiration) : sinusoïdale. */
  sine: [0.37, 0, 0.63, 1] as const,
} as const;

/** Mobile : durées × 0,8 (adaptation au support, skill « context adaptation »). */
const SCALE = typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches ? 0.8 : 1;

/** Durées en secondes. */
export const DUR = {
  micro: 0.09, // survol, retour tactile (< 100 ms) — jamais réduit
  quick: 0.18 * SCALE, // pression, bascule
  standard: 0.3 * SCALE, // panneaux, cartes
  slow: 0.5 * SCALE, // transitions de page, scène produit
  drama: 0.8 * SCALE, // grands titres, retournement d'un vêtement
} as const;

/** Une sortie dure ~65 % de l'entrée correspondante. */
export const exitOf = (d: number) => +(d * 0.65).toFixed(3);

/** Ressorts par matière. */
export const SPRING = {
  /** Tissu lourd : amorti, dépassement < 5 %. */
  fabric: { type: "spring", stiffness: 170, damping: 24, mass: 1.1 } as const,
  /** Tissu en vol (pièce qui quitte le portant) : un peu plus lent, aucun dépassement visible. */
  carry: { type: "spring", stiffness: 120, damping: 22, mass: 1.2 } as const,
  /** Interface (pastilles, indicateurs) : sec et précis. */
  ui: { type: "spring", stiffness: 520, damping: 42 } as const,
  /** Étiquette cartonnée suspendue : balancier vif. */
  tag: { type: "spring", stiffness: 300, damping: 13 } as const,
} as const;

/** Décalages en cascade (secondes) — budgets du skill : micro < 200 ms, standard < 400 ms. */
export const STAGGER = { micro: 0.03, standard: 0.06, dramatic: 0.09 } as const;

/** Délai de cascade plafonné pour que le total reste sous 500 ms. */
export function stagger(i: number, step: number = STAGGER.standard, budget = 0.45) {
  return Math.min(i * step, budget);
}

/** Ordre « du centre vers les bords » (cascade centre-out du skill). */
export function centerOut(i: number, n: number) {
  return Math.abs(i - (n - 1) / 2);
}

/** Transition d'entrée signature. */
export const enter = (duration: number = DUR.standard, delay = 0) => ({ duration, delay, ease: EASE.out });
/** Transition de sortie (accélération, plus courte). */
export const leave = (duration: number = DUR.standard) => ({ duration: exitOf(duration), ease: EASE.in });

/** Entrée type « affiche collée » (variants Motion). */
export const posterIn = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: enter(DUR.slow, delay) }),
  exit: { opacity: 0, y: -12, transition: leave(DUR.standard) },
};

/** Secousse d'erreur : ±12 px, 3 oscillations décroissantes, 360 ms, aucun dépassement. */
export const SHAKE = { x: [0, -12, 10, -6, 3, 0], transition: { duration: 0.36, ease: EASE.inOut } };
