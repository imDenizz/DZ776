/**
 * Rendu vectoriel des vêtements (maquettes temporaires).
 *
 * Chaque pièce est dessinée en SVG : silhouette, ombrage du tissu, plis, coutures,
 * bord-côtes, print poitrine (devant) et slogan (dos). Quand les photos définitives
 * existeront, il suffira de remplacer ce composant par des <Image>.
 */
import { useId } from "react";
import type { Colorway, Product } from "@/data/products";
import { BRAND, COLLECTION } from "@/config/brand";
import { mix } from "@/lib/color";

export type Side = "front" | "back";

/** Le viewBox inclut une marge haute pour le crochet du cintre. */
export const GARMENT_VIEWBOX = "0 -70 400 550";
export const GARMENT_RATIO = 400 / 550;
/** Position verticale de la tringle dans le viewBox (en % de la hauteur). */
export const RAIL_Y = (70 - 44) / 550;

/* ---------- Silhouettes ---------- */

const TEE = {
  body: "M163,40 Q200,58 237,40 L300,58 Q340,104 374,166 L320,196 Q311,182 304,172 L306,428 Q200,438 94,428 L96,172 Q89,182 80,196 L26,166 Q60,104 100,58 Z",
  neckFront: "M163,40 Q200,58 237,40 Q200,82 163,40 Z",
  collarFront: "M163,40 Q200,82 237,40",
  collarBack: "M163,40 Q200,58 237,40",
  seams: ["M100,58 Q110,112 96,172", "M300,58 Q290,112 304,172"],
  stitches: ["M98,418 Q200,428 302,418", "M33,155 L85,184", "M367,155 L315,184"],
  folds: [
    "M108,190 Q146,270 130,380",
    "M292,190 Q256,262 270,370",
    "M160,428 Q176,380 168,320",
    "M246,428 Q232,392 240,340",
    "M58,120 Q74,150 84,192",
    "M342,120 Q326,150 316,192",
  ],
  highlights: ["M190,110 Q214,240 196,410", "M120,200 Q150,280 142,360"],
  chest: { x: 252, y: 108 },
  back: { top: 116, width: 196, maxHeight: 270 },
};

const HOODIE = {
  body: "M158,52 Q200,64 242,52 L304,70 C338,92 356,180 362,300 L368,384 L326,390 L318,300 C315,262 310,232 305,208 L307,428 L93,428 L95,208 C90,232 85,262 82,300 L74,390 L32,384 L38,300 C44,180 62,92 96,70 Z",
  cuffs: "M32,384 L74,390 L72,418 L30,412 Z M368,384 L326,390 L328,418 L370,412 Z",
  hem: "M93,428 L307,428 L309,460 Q200,468 91,460 Z",
  hoodBehind: "M150,66 C138,30 170,14 200,14 C230,14 262,30 250,66 Z",
  hoodOpening: "M158,52 Q200,44 242,52 Q238,104 200,114 Q162,104 158,52 Z",
  hoodRims: ["M160,54 Q162,100 206,114", "M240,54 Q238,100 194,114"],
  hoodBack: "M158,52 Q200,64 242,52 C262,64 266,100 262,140 Q248,178 200,190 Q152,178 138,140 C134,100 138,64 158,52 Z",
  pocket: "M136,318 L264,318 L292,420 L108,420 Z",
  seams: ["M96,70 Q106,140 95,208", "M304,70 Q294,140 305,208"],
  stitches: ["M136,324 L264,324", "M93,434 L307,434"],
  folds: [
    "M104,220 Q138,300 126,410",
    "M296,220 Q262,300 274,410",
    "M60,160 Q66,250 58,370",
    "M340,160 Q334,250 342,370",
    "M170,190 Q184,250 176,310",
  ],
  highlights: ["M196,130 Q216,240 200,310", "M48,200 Q52,280 46,360", "M352,200 Q348,280 354,360"],
  chest: { x: 256, y: 150 },
  back: { top: 202, width: 184, maxHeight: 186 },
};

/* ---------- Slogan : mise en page « affiche » justifiée ---------- */

/** Ratio largeur/hauteur moyen d'une capitale Anton. */
const ANTON_RATIO = 0.47;

function layoutSlogan(lines: string[], width: number, maxHeight: number) {
  const raw = lines.map((l) => Math.min(96, width / (Math.max(l.length, 2) * ANTON_RATIO)));
  const leading = 0.94;
  const total = raw.reduce((s, fs) => s + fs * leading, 0);
  const k = total > maxHeight ? maxHeight / total : 1;
  let y = 0;
  return lines.map((text, i) => {
    const fs = raw[i] * k;
    y += fs * leading;
    return { text, fs, y, w: width * (k < 1 ? Math.max(k, 0.82) : 1) };
  });
}

type GarmentProps = {
  product: Product;
  colorway: Colorway;
  side?: Side;
  /** Désactive le grain et l'usure du print (portant, vignettes). */
  lite?: boolean;
  /** Dessine le crochet du cintre. */
  hanger?: boolean;
  /** Recadrage (zoom détail). */
  viewBox?: string;
  className?: string;
  decorative?: boolean;
};

export function Garment({
  product,
  colorway,
  side = "front",
  lite = false,
  hanger = false,
  viewBox = GARMENT_VIEWBOX,
  className,
  decorative = false,
}: GarmentProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = (k: string) => `${uid}${k}`;
  const url = (k: string) => `url(#${ref(k)})`;

  const isHoodie = product.type === "hoodie";
  const label = decorative
    ? undefined
    : `${product.label} ${product.name}, ${colorway.name}, vue ${side === "front" ? "de face" : "de dos"}`;

  // Visuel détouré (800×1100) posé dans le même repère que le dessin SVG :
  // le cintre, la rotation et les recadrages de détail fonctionnent à l'identique.
  if (colorway.image) {
    return (
      <svg viewBox={viewBox} className={className} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={label}>
        {hanger && <HangerShape />}
        <image href={side === "front" ? colorway.image.front : colorway.image.back} x="0" y="-70" width="400" height="550" preserveAspectRatio="xMidYMid meet" />
      </svg>
    );
  }
  const s = isHoodie ? HOODIE : TEE;
  const fabric = colorway.fabric;
  const isLight = luminance(fabric) > 0.5;
  const shadow = mix(fabric, "#000000", isLight ? 0.28 : 0.55);
  const deep = mix(fabric, "#000000", isLight ? 0.45 : 0.75);
  const rib = mix(fabric, isLight ? "#000000" : "#ffffff", isLight ? 0.06 : 0.05);
  const hl = isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.08)";
  const fold = isLight ? "rgba(60,50,40,0.16)" : "rgba(0,0,0,0.45)";

  const slogan = layoutSlogan(product.slogan.lines, s.back.width, s.back.maxHeight);
  const sloganH = slogan.at(-1)?.y ?? 0;
  const clipShapes = isHoodie ? [HOODIE.body, HOODIE.cuffs, HOODIE.hem] : [TEE.body];

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${product.label} ${product.name}, ${colorway.name}, vue ${side === "front" ? "de face" : "de dos"}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={ref("c")}>
          {clipShapes.map((d) => (
            <path key={d} d={d} />
          ))}
        </clipPath>
        <linearGradient id={ref("h")} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={isLight ? 0.18 : 0.45} />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity={isLight ? 0.25 : 0.05} />
          <stop offset="0.78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={isLight ? 0.2 : 0.5} />
        </linearGradient>
        <linearGradient id={ref("v")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={isLight ? 0.2 : 0.04} />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={isLight ? 0.12 : 0.35} />
        </linearGradient>
        <pattern id={ref("r")} width="5" height="10" patternUnits="userSpaceOnUse">
          <rect width="5" height="10" fill={rib} />
          <line x1="1" y1="0" x2="1" y2="10" stroke="#000" strokeOpacity={isLight ? 0.12 : 0.4} strokeWidth="1.4" />
        </pattern>
        {!lite && (
          <filter id={ref("n")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
        {!lite && (
          <filter id={ref("d")}>
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="t" />
            <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 5.3" result="m" />
            <feComposite in="SourceGraphic" in2="m" operator="in" />
          </filter>
        )}
        <filter id={ref("f")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {colorway.washed && (
          <filter id={ref("w")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.045" numOctaves="3" seed="3" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -1.05" />
          </filter>
        )}
      </defs>

      {hanger && <HangerShape />}

      {/* Capuche visible derrière le col (vue de face) */}
      {isHoodie && side === "front" && <path d={HOODIE.hoodBehind} fill={shadow} />}

      {/* ---- Tissu ---- */}
      <g clipPath={url("c")}>
        <rect x="0" y="0" width="400" height="480" fill={fabric} />
        {colorway.washed && <rect x="0" y="0" width="400" height="480" filter={url("w")} opacity="0.16" />}
        {isHoodie && (
          <>
            <path d={HOODIE.cuffs} fill={url("r")} />
            <path d={HOODIE.hem} fill={url("r")} />
          </>
        )}
        <rect x="0" y="0" width="400" height="480" fill={url("h")} />
        <rect x="0" y="0" width="400" height="480" fill={url("v")} />

        {/* Plis et reflets, adoucis par un flou */}
        <g fill="none" strokeLinecap="round" filter={url("f")}>
          {s.folds.map((d) => (
            <path key={d} d={d} stroke={fold} strokeWidth="16" />
          ))}
          {s.highlights.map((d) => (
            <path key={d} d={d} stroke={hl} strokeWidth="14" />
          ))}
        </g>
        <g fill="none" strokeLinecap="round">
          {s.seams.map((d) => (
            <path key={d} d={d} stroke={deep} strokeOpacity="0.55" strokeWidth="1.6" />
          ))}
          {s.stitches.map((d) => (
            <path key={d} d={d} stroke={deep} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 3" />
          ))}
        </g>

        {/* Poche kangourou */}
        {isHoodie && side === "front" && (
          <g>
            <path d={HOODIE.pocket} fill="#000" fillOpacity={isLight ? 0.04 : 0.12} />
            <path d="M136,318 L108,420 M264,318 L292,420" stroke={deep} strokeWidth="4" strokeOpacity="0.7" fill="none" />
            <path d="M140,326 L114,416 M260,326 L286,416 M136,318 L264,318" stroke={deep} strokeOpacity="0.45" strokeWidth="1.1" strokeDasharray="3 3" fill="none" />
          </g>
        )}

        {/* Capuche à plat dans le dos */}
        {isHoodie && side === "back" && (
          <g>
            <path d={HOODIE.hoodBack} fill={mix(fabric, "#000", 0.08)} />
            <path d={HOODIE.hoodBack} fill="none" stroke={deep} strokeOpacity="0.6" strokeWidth="2.5" />
            <path d="M200,62 L200,190" stroke={deep} strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="3 3" />
            <path d="M150,90 Q156,150 190,182" stroke={hl} strokeWidth="10" fill="none" strokeLinecap="round" filter={url("f")} />
          </g>
        )}

        {/* ---- Prints ---- */}
        <g filter={lite ? undefined : url("d")}>
          {side === "front" ? (
            <ChestLogo x={s.chest.x} y={s.chest.y} color={colorway.logo} accent={colorway.accent} />
          ) : (
            <g transform={`translate(200 ${s.back.top + (s.back.maxHeight - sloganH) * 0.3})`}>
              {slogan.map((l, i) => (
                <text
                  key={i}
                  x={0}
                  y={l.y}
                  textAnchor="middle"
                  fontFamily="Anton, Impact, 'Arial Narrow', sans-serif"
                  fontSize={l.fs}
                  textLength={l.w}
                  lengthAdjust="spacingAndGlyphs"
                  fill={product.slogan.accent?.includes(i) ? colorway.accent : colorway.ink}
                >
                  {l.text}
                </text>
              ))}
              <text
                x={0}
                y={sloganH + 20}
                textAnchor="middle"
                fontFamily="'Space Mono', ui-monospace, monospace"
                fontSize="7.5"
                letterSpacing="1.2"
                fill={colorway.ink}
                fillOpacity="0.75"
              >
                {`${COLLECTION.full} — ${product.number}`}
              </text>
            </g>
          )}
        </g>

        {!lite && (
          <rect x="0" y="0" width="400" height="480" filter={url("n")} opacity={isLight ? 0.1 : 0.14} style={{ mixBlendMode: "overlay" }} />
        )}
      </g>

      {/* ---- Col / capuche par-dessus ---- */}
      {!isHoodie && side === "front" && (
        <>
          <path d={TEE.neckFront} fill={deep} />
          <path d={TEE.collarFront} fill="none" stroke={rib} strokeWidth="9" />
          <path d={TEE.collarFront} fill="none" stroke={shadow} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2.5 2.5" transform="translate(0 4)" />
          <rect x="192" y="44" width="16" height="9" fill={colorway.accent} opacity="0.9" />
        </>
      )}
      {!isHoodie && side === "back" && (
        <path d={TEE.collarBack} fill="none" stroke={rib} strokeWidth="8" />
      )}
      {isHoodie && side === "front" && (
        <>
          <path d={HOODIE.hoodOpening} fill={deep} />
          {HOODIE.hoodRims.map((d) => (
            <path key={d} d={d} fill="none" stroke={mix(fabric, "#fff", isLight ? 0 : 0.05)} strokeWidth="10" strokeLinecap="round" />
          ))}
          <g stroke={isLight ? "#2a2a2a" : "#e8e5dd"} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M188,108 Q184,150 186,186" />
            <path d="M212,108 Q217,150 214,190" />
          </g>
          <rect x="183" y="184" width="6" height="12" rx="1" fill={colorway.accent} />
          <rect x="211" y="188" width="6" height="12" rx="1" fill={colorway.accent} />
        </>
      )}
      {isHoodie && side === "back" && (
        <path d="M158,52 Q200,64 242,52" fill="none" stroke={deep} strokeOpacity="0.5" strokeWidth="2" />
      )}
    </svg>
  );
}

function ChestLogo({ x, y, color, accent }: { x: number; y: number; color: string; accent: string }) {
  const [a, b] = BRAND.wordmark;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-21" y="-11" width="3" height="23" fill={accent === color ? color : accent} />
      <text x="-14" y="0" fontFamily="Anton, Impact, sans-serif" fontSize="11.5" letterSpacing="0.6" fill={color}>
        {a}
      </text>
      <text x="-14" y="12" fontFamily="Anton, Impact, sans-serif" fontSize="11.5" letterSpacing="0.6" fill={color}>
        {b}
      </text>
    </g>
  );
}

/**
 * Cintre en bois + crochet chromé, dans le repère du vêtement.
 * Le vêtement est vu de face : le crochet est donc vu par la tranche. Sa tige monte droit
 * vers la tringle et s'enroule par-dessus (la boucle part derrière la tringle).
 * Le cintre est dessiné avant le vêtement : seule la tête en bois dépasse au-dessus du col.
 */
const HOOK = "M200,24 L200,-47 C200,-57 203,-61 207.5,-61 C212,-61 214,-57 214,-51";

export function HangerShape({ rail = false }: { rail?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c08f62" />
          <stop offset="0.35" stopColor="#9a6a43" />
          <stop offset="1" stopColor="#5c3b22" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6c7075" />
          <stop offset="0.35" stopColor="#f4f5f7" />
          <stop offset="0.6" stopColor="#b9bdc2" />
          <stop offset="1" stopColor="#5d6166" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d8186" />
          <stop offset="0.2" stopColor="#f7f8fa" />
          <stop offset="0.45" stopColor="#c6c9cd" />
          <stop offset="0.75" stopColor="#868a8f" />
          <stop offset="1" stopColor="#55595e" />
        </linearGradient>
      </defs>

      {rail && (
        <g>
          <rect x="-2000" y="-35" width="4400" height="9" fill="#2a2016" opacity="0.05" />
          <rect x="-2000" y="-51" width="4400" height="14" rx="7" fill={`url(#${id}r)`} />
        </g>
      )}

      {/* Ombre portée du crochet sur le mur */}
      <path d={HOOK} transform="translate(5 8)" fill="none" stroke="#2a2016" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />

      {/* Tête du cintre en bois (les bras sont cachés dans le vêtement) */}
      <path
        d="M166,52 C179,37 190,25 200,25 C210,25 221,37 234,52 L234,62 C221,48 210,37 200,37 C190,37 179,48 166,62 Z"
        fill={`url(#${id}w)`}
      />
      <path d="M172,44 C182,34 191,27 200,27 C209,27 218,34 228,44" fill="none" stroke="#e2bc94" strokeOpacity="0.55" strokeWidth="1.3" />

      {/* Crochet chromé : bord sombre, corps, reflet */}
      <path d={HOOK} fill="none" stroke="#4b4f54" strokeWidth="6.4" strokeLinecap="round" />
      <path d={HOOK} fill="none" stroke="#a9adb2" strokeWidth="4.6" strokeLinecap="round" />
      <path d={HOOK} transform="translate(-1.2 0)" fill="none" stroke="#fbfcfd" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" />

      {/* Écrou chromé à la base du crochet */}
      <rect x="195" y="13" width="10" height="13" rx="2" fill={`url(#${id}c)`} />
      <rect x="194" y="22" width="12" height="3" rx="1.2" fill="#55595e" />
    </g>
  );
}

/** Version autonome du cintre (au-dessus d'un vêtement qui pivote), avec ou sans tringle. */
export function Hanger({ className, rail = false }: { className?: string; rail?: boolean }) {
  return (
    <svg viewBox={GARMENT_VIEWBOX} className={className} aria-hidden="true" style={rail ? { overflow: "visible" } : undefined}>
      <HangerShape rail={rail} />
    </svg>
  );
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
