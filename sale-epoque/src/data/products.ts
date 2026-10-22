/**
 * Catalogue — COLLECTION 001 « RIEN À TAIRE ».
 *
 * Toute la boutique lit ces données via `src/lib/catalog.ts`.
 * Pour brancher Shopify plus tard, il suffit de remplacer l'implémentation de ce module
 * en conservant les types ci-dessous.
 */

export type GarmentType = "hoodie" | "tshirt";

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

/** Quantité maximale par ligne de panier. */
export const MAX_QTY = 10;

export type Colorway = {
  id: string;
  name: string;
  /** Couleur du tissu (rendu des maquettes). */
  fabric: string;
  /** Couleur du petit logo poitrine. */
  logo: string;
  /** Couleur principale du slogan dans le dos. */
  ink: string;
  /** Couleur d'accent (lignes mises en avant, détails). */
  accent: string;
  /** Effet délavé sur le tissu. */
  washed?: boolean;
};

export type Product = {
  slug: string;
  number: string;
  name: string;
  type: GarmentType;
  /** Libellé lisible : « Hoodie oversize ». */
  label: string;
  /** Prix TTC en euros. Prix fictifs de prototype. */
  price: number;
  slogan: {
    lines: string[];
    /** Index des lignes imprimées en couleur d'accent. */
    accent?: number[];
  };
  short: string;
  description: string;
  details: string[];
  colorways: Colorway[];
  sizes: readonly Size[];
  /** `maquette` tant que les vrais visuels photo ne sont pas produits. */
  visual: "maquette" | "photo";
};

const OFF_WHITE = "#F2F0EA";
const INK = "#111111";
const RED = "#C1121F";

/** Spécifications communes — objectifs de production, pas encore des pièces fabriquées. */
const HOODIE_SPECS = [
  "Coupe oversize, épaules tombantes",
  "Molleton gratté lourd (grammage visé : 400 g/m²)",
  "Capuche doublée, cordons plats",
  "Poche kangourou, bord-côtes aux poignets et à la taille",
  "Impression sérigraphie dos + poitrine",
];

const TEE_SPECS = [
  "Coupe oversize, col côtelé épais",
  "Jersey coton (grammage visé : 240 g/m²)",
  "Manches tombantes, longueur boxy",
  "Impression sérigraphie dos + poitrine",
];

export const PRODUCTS: Product[] = [
  {
    slug: "no-pasaran",
    number: "01",
    name: "NO PASARÁN",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 69,
    slogan: { lines: ["NO", "PASARÁN"], accent: [1] },
    short: "Ils ne passeront pas. Ni hier, ni aujourd'hui.",
    description:
      "Le cri de Madrid 1936 sur un hoodie noir taillé large. Petit logo rouge sur le cœur, grand « NO PASARÁN » dans le dos. Une pièce pour celles et ceux qui refusent de laisser la haine prendre la rue.",
    details: HOODIE_SPECS,
    colorways: [
      { id: "noir", name: "Noir", fabric: "#141414", logo: RED, ink: OFF_WHITE, accent: RED },
      { id: "anthracite", name: "Anthracite", fabric: "#2E2E2E", logo: RED, ink: OFF_WHITE, accent: RED },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
  {
    slug: "sale-epoque",
    number: "02",
    name: "SALE ÉPOQUE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 35,
    slogan: { lines: ["SALE ÉPOQUE,", "BELLES", "RÉSISTANCES"], accent: [0] },
    short: "L'époque est sale. Les résistances sont belles.",
    description:
      "Le t-shirt manifeste de la maison. Blanc cassé, petit logo noir devant, et dans le dos le constat et la réponse : « SALE ÉPOQUE, BELLES RÉSISTANCES ».",
    details: TEE_SPECS,
    colorways: [
      { id: "blanc-casse", name: "Blanc cassé", fabric: "#ECE8DE", logo: INK, ink: INK, accent: RED },
      { id: "noir", name: "Noir", fabric: "#151515", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
  {
    slug: "pas-dociles",
    number: "03",
    name: "PAS DOCILES",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 75,
    slogan: { lines: ["ON N’EST", "PAS NÉS", "POUR", "OBÉIR"], accent: [3] },
    short: "Personne n'est né pour baisser la tête.",
    description:
      "Hoodie gris anthracite, impression blanche et rouge. « ON N'EST PAS NÉS POUR OBÉIR » : un rappel que la désobéissance face à l'injustice est une tradition, pas une exception.",
    details: HOODIE_SPECS,
    colorways: [
      { id: "anthracite", name: "Anthracite", fabric: "#2B2B2B", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
      { id: "noir", name: "Noir", fabric: "#131313", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
  {
    slug: "human-first",
    number: "04",
    name: "HUMAN FIRST",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["NO HUMAN", "IS", "ILLEGAL"], accent: [2] },
    short: "Aucun être humain n'est illégal.",
    description:
      "T-shirt noir oversize. Trois mots dans le dos, impossibles à ignorer. Pour la dignité de toutes les personnes exilées, sans condition.",
    details: TEE_SPECS,
    colorways: [
      { id: "noir", name: "Noir", fabric: "#121212", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
      { id: "blanc-casse", name: "Blanc cassé", fabric: "#ECE8DE", logo: INK, ink: INK, accent: RED },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
  {
    slug: "egalite-radicale",
    number: "05",
    name: "ÉGALITÉ RADICALE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["NOS DROITS", "NE SE", "NÉGOCIENT", "PAS"] },
    short: "Les droits ne sont pas une monnaie d'échange.",
    description:
      "T-shirt rouge sombre, impression blanc cassé. « NOS DROITS NE SE NÉGOCIENT PAS » — pour l'égalité réelle, entre toutes et tous, sans astérisque.",
    details: TEE_SPECS,
    colorways: [
      { id: "rouge-sombre", name: "Rouge sombre", fabric: "#6B1018", logo: OFF_WHITE, ink: OFF_WHITE, accent: OFF_WHITE },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
  {
    slug: "contre-ordre",
    number: "06",
    name: "CONTRE-ORDRE",
    type: "hoodie",
    label: "Hoodie oversize délavé",
    price: 79,
    slogan: { lines: ["LE SILENCE", "NE CHANGE", "RIEN"], accent: [2] },
    short: "Se taire, c'est déjà choisir un camp.",
    description:
      "Hoodie noir délavé, traitement à l'acide pour un rendu usé dès le premier jour. Dans le dos : « LE SILENCE NE CHANGE RIEN ». La pièce la plus lourde de la collection, au propre comme au figuré.",
    details: [...HOODIE_SPECS.slice(0, 4), "Délavage acide — chaque pièce sera unique", "Impression sérigraphie dos + poitrine"],
    colorways: [
      { id: "noir-delave", name: "Noir délavé", fabric: "#2A2826", logo: RED, ink: OFF_WHITE, accent: RED, washed: true },
    ],
    sizes: SIZES,
    visual: "maquette",
  },
];

/** Guide des tailles — mesures à plat (cm), indicatives pour le prototype. */
export const SIZE_GUIDE: Record<GarmentType, { headers: string[]; rows: Record<Size, number[]> }> = {
  hoodie: {
    headers: ["Largeur poitrine", "Longueur dos", "Longueur manche"],
    rows: {
      XS: [60, 68, 58],
      S: [63, 70, 59],
      M: [66, 72, 60],
      L: [69, 74, 61],
      XL: [72, 76, 62],
      XXL: [75, 78, 63],
    },
  },
  tshirt: {
    headers: ["Largeur poitrine", "Longueur dos", "Longueur manche"],
    rows: {
      XS: [55, 68, 22],
      S: [58, 70, 23],
      M: [61, 72, 24],
      L: [64, 74, 25],
      XL: [67, 76, 26],
      XXL: [70, 78, 27],
    },
  },
};
