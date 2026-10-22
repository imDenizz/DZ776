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
  /** Visuels détourés (devant / dos). Sans eux, la pièce est dessinée en SVG. */
  image?: { front: string; back: string; /** Visuel assez net pour le zoom détail. */ hd?: boolean };
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

/** Pièces dont les visuels viennent de fichiers HD dédiés (scripts/visuels-hd.py), pas de la planche. */
const HD = new Set([
  "no-pasaran",
  "sale-epoque",
  "pas-dociles",
  "human-first",
  "egalite-radicale",
  "contre-ordre",
  "systeme-toxique",
  "triple-force",
  "anti-raciste-toujours",
]);

/** Coloris illustré par les visuels détourés de /public/products/<slug>-front|back.webp */
function pictured(slug: string, c: Omit<Colorway, "image">): Colorway {
  return { ...c, image: { front: `/products/${slug}-front.webp`, back: `/products/${slug}-back.webp`, hd: HD.has(slug) } };
}

/** Teintes des coloris supplémentaires (mêmes valeurs que scripts/coloris.py). */
const SHADES = {
  noir: { name: "Noir", fabric: "#161616" },
  rouge: { name: "Rouge", fabric: "#A3121B" },
  gris: { name: "Gris", fabric: "#8A8986" },
  "gris-clair": { name: "Gris clair", fabric: "#B3B1AC" },
  anthracite: { name: "Anthracite", fabric: "#3B3A38" },
  sable: { name: "Sable", fabric: "#C6B8A4" },
  creme: { name: "Crème", fabric: "#EBE6DC" },
  rose: { name: "Rose poudré", fabric: "#D6A99B" },
  bordeaux: { name: "Bordeaux", fabric: "#5A1219" },
} as const;

type Shade = keyof typeof SHADES;

/**
 * Coloris dérivé : visuels générés par scripts/coloris.py
 * (/public/products/<slug>-<coloris>-front|back.webp).
 */
function variant(slug: string, id: Shade): Colorway {
  const { name, fabric } = SHADES[id];
  const light = ["sable", "creme", "rose", "gris-clair"].includes(id);
  return {
    id,
    name,
    fabric,
    logo: light ? INK : OFF_WHITE,
    ink: light ? INK : OFF_WHITE,
    accent: id === "rouge" ? OFF_WHITE : RED,
    image: { front: `/products/${slug}-${id}-front.webp`, back: `/products/${slug}-${id}-back.webp`, hd: HD.has(slug) },
  };
}

type Def = Omit<Product, "details" | "sizes" | "visual" | "colorways"> & {
  colorway: Omit<Colorway, "image">;
  /** Autres coloris proposés (pastilles de la planche de collection). */
  more: Shade[];
};

const DEFS: Def[] = [
  {
    slug: "no-pasaran",
    number: "01",
    name: "NO PASARÁN",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 69,
    slogan: { lines: ["NO", "PASARÁN", "CONTRE LE FASCISME TOUJOURS"], accent: [0] },
    short: "Ils ne passeront pas. Ni hier, ni aujourd'hui.",
    description:
      "Le cri de Madrid 1936 sur un hoodie noir taillé large. Petit logo sur le cœur, et dans le dos « NO PASARÁN — contre le fascisme, toujours ». Une pièce pour celles et ceux qui refusent de laisser la haine prendre la rue.",
    colorway: { id: "noir", name: "Noir", fabric: "#141414", logo: RED, ink: OFF_WHITE, accent: RED },
    more: ["rouge", "gris"],
  },
  {
    slug: "sale-epoque",
    number: "02",
    name: "SALE ÉPOQUE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 35,
    slogan: { lines: ["SALE ÉPOQUE", "BELLES RÉSISTANCES", "MÊMES LUTTES • MÊMES VIES • MÊME ESPOIR"] },
    short: "L'époque est sale. Les résistances sont belles.",
    description:
      "Le t-shirt manifeste de la maison. Blanc cassé, petit logo devant, et dans le dos une photo de foule entre deux phrases : « SALE ÉPOQUE », « BELLES RÉSISTANCES ».",
    colorway: { id: "blanc-casse", name: "Blanc cassé", fabric: "#ECE8DE", logo: INK, ink: INK, accent: RED },
    more: ["noir", "rose"],
  },
  {
    slug: "pas-dociles",
    number: "03",
    name: "PAS DOCILES",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 75,
    slogan: { lines: ["ON N’EST", "PAS NÉS", "POUR OBÉIR"] },
    short: "Personne n'est né pour baisser la tête.",
    description:
      "Hoodie gris anthracite délavé, impression blanche et rouge. « ON N'EST PAS NÉS POUR OBÉIR » au-dessus d'une foule : un rappel que la désobéissance face à l'injustice est une tradition, pas une exception.",
    colorway: { id: "anthracite", name: "Gris anthracite", fabric: "#2B2B2B", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED, washed: true },
    more: ["rouge", "gris"],
  },
  {
    slug: "human-first",
    number: "04",
    name: "HUMAN FIRST",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["NO HUMAN", "IS", "ILLEGAL", "MÊMES FRONTIÈRES • MÊMES DROITS • MÊME HUMANITÉ"], accent: [2] },
    short: "Aucun être humain n'est illégal.",
    description:
      "T-shirt noir oversize. « NO HUMAN IS ILLEGAL » en lettres massives dans le dos. Pour la dignité de toutes les personnes exilées, sans condition.",
    colorway: { id: "noir", name: "Noir", fabric: "#121212", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
    more: ["sable", "gris-clair"],
  },
  {
    slug: "egalite-radicale",
    number: "05",
    name: "ÉGALITÉ RADICALE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["NOS DROITS", "NE SE", "NÉGOCIENT PAS", "ÉGALITÉ • SOLIDARITÉ • JUSTICE POUR TOUT·ES"] },
    short: "Les droits ne sont pas une monnaie d'échange.",
    description:
      "T-shirt rouge, impression blanc cassé. « NOS DROITS NE SE NÉGOCIENT PAS » au-dessus d'un cortège : pour l'égalité réelle, entre toutes et tous, sans astérisque.",
    colorway: { id: "rouge", name: "Rouge", fabric: "#A81C21", logo: OFF_WHITE, ink: OFF_WHITE, accent: OFF_WHITE },
    more: ["noir", "gris"],
  },
  {
    slug: "contre-ordre",
    number: "06",
    name: "CONTRE-ORDRE",
    type: "hoodie",
    label: "Hoodie oversize délavé",
    price: 79,
    slogan: { lines: ["LE SILENCE", "NE CHANGE", "RIEN"] },
    short: "Se taire, c'est déjà choisir un camp.",
    description:
      "Hoodie noir délavé, rendu usé dès le premier jour. Dans le dos : « LE SILENCE NE CHANGE RIEN » au-dessus d'une silhouette dans la fumée. La pièce la plus lourde de la collection, au propre comme au figuré.",
    colorway: { id: "noir-delave", name: "Noir délavé", fabric: "#2A2826", logo: RED, ink: OFF_WHITE, accent: RED, washed: true },
    more: ["anthracite", "gris"],
  },
  {
    slug: "systeme-toxique",
    number: "07",
    name: "SYSTÈME TOXIQUE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["SYSTÈME", "TOXIQUE", "MÊMES PROFITS", "MÊMES VICTIMES"], accent: [1] },
    short: "Toujours les mêmes qui encaissent, toujours les mêmes qui trinquent.",
    description:
      "T-shirt blanc cassé. Dans le dos, une ville sous la fumée et deux lignes qui résument tout : « MÊMES PROFITS, MÊMES VICTIMES ». Contre un modèle qui sacrifie les gens et la planète.",
    colorway: { id: "blanc-casse", name: "Blanc cassé", fabric: "#ECE8DE", logo: INK, ink: INK, accent: RED },
    more: ["noir", "sable"],
  },
  {
    slug: "triple-force",
    number: "08",
    name: "TRIPLE FORCE",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 69,
    slogan: { lines: ["LIBERTÉ", "ÉGALITÉ", "SOLIDARITÉ"], accent: [0, 1, 2] },
    short: "Trois mots. À prendre au sérieux, tous les trois.",
    description:
      "Hoodie noir, devise réécrite en rouge dans le dos : « LIBERTÉ, ÉGALITÉ, SOLIDARITÉ », au-dessus d'un poing levé. Parce que la fraternité, ça se pratique.",
    colorway: { id: "noir", name: "Noir", fabric: "#131313", logo: OFF_WHITE, ink: RED, accent: RED },
    more: ["rouge", "gris"],
  },
  {
    slug: "anti-raciste-toujours",
    number: "09",
    name: "ANTI RACISTE TOUJOURS",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["ANTI", "RACISTE", "TOUJOURS", "MÊMES VIES • MÊMES DROITS • MÊME MONDE"] },
    short: "Pas de pause, pas d'exception.",
    description:
      "T-shirt gris anthracite délavé, globe rouge dans le dos. « ANTI RACISTE TOUJOURS — mêmes vies, mêmes droits, même monde ».",
    colorway: { id: "anthracite", name: "Gris anthracite", fabric: "#2E2E2E", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED, washed: true },
    more: ["noir", "creme"],
  },
  {
    slug: "plus-d-amour",
    number: "10",
    name: "PLUS D’AMOUR",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["PLUS D’AMOUR", "MOINS DE HAINE"] },
    short: "Une rose plus forte que les barbelés.",
    description:
      "T-shirt noir, rose rouge qui pousse à travers les barbelés, et une phrase simple : « PLUS D'AMOUR, MOINS DE HAINE ». La pièce la plus douce de la collection, pas la moins déterminée.",
    colorway: { id: "noir", name: "Noir", fabric: "#121212", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
    more: ["bordeaux", "gris-clair"],
  },
  {
    slug: "memes-luttes",
    number: "11",
    name: "MÊMES LUTTES",
    type: "hoodie",
    label: "Hoodie oversize",
    price: 69,
    slogan: { lines: ["MÊMES LUTTES", "MÊMES VIES", "SOLIDARITÉ TOUJOURS"] },
    short: "On ne se bat pas chacun dans son coin.",
    description:
      "Hoodie bordeaux. Dans le dos, une rangée de silhouettes épaule contre épaule : « MÊMES LUTTES, MÊMES VIES — SOLIDARITÉ TOUJOURS ».",
    colorway: { id: "bordeaux", name: "Bordeaux", fabric: "#5A1219", logo: OFF_WHITE, ink: OFF_WHITE, accent: RED },
    more: ["noir", "gris"],
  },
  {
    slug: "un-autre-monde",
    number: "12",
    name: "UN AUTRE MONDE",
    type: "tshirt",
    label: "T-shirt oversize",
    price: 39,
    slogan: { lines: ["UN AUTRE MONDE", "EST POSSIBLE", "PAS UNE UTOPIE, UNE NÉCESSITÉ"] },
    short: "Pas une utopie. Une nécessité.",
    description:
      "T-shirt blanc cassé, globe dans le viseur. « UN AUTRE MONDE EST POSSIBLE — pas une utopie, une nécessité ». Pour celles et ceux qui pensent que demain se construit maintenant.",
    colorway: { id: "blanc-casse", name: "Blanc cassé", fabric: "#ECE8DE", logo: INK, ink: INK, accent: RED },
    more: ["noir", "sable"],
  },
];

export const PRODUCTS: Product[] = DEFS.map(({ colorway, more, ...d }) => ({
  ...d,
  details:
    d.slug === "contre-ordre"
      ? [...HOODIE_SPECS.slice(0, 4), "Délavage acide — chaque pièce sera unique", "Impression sérigraphie dos + poitrine"]
      : d.type === "hoodie"
        ? HOODIE_SPECS
        : TEE_SPECS,
  colorways: [pictured(d.slug, colorway), ...more.map((id) => variant(d.slug, id))],
  sizes: SIZES,
  visual: "maquette",
}));

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
