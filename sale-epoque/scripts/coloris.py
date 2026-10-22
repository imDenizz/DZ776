"""
Génère les coloris supplémentaires à partir des visuels détourés (devant / dos).

    python3 scripts/coloris.py <dossier des PNG détourés> public/products

Principe : on isole le tissu (pixels proches de la couleur de base de la pièce), on le recolore
en conservant son ombrage, et on laisse le print intact. Si le contraste print / tissu s'effondre
(print noir sur tissu devenu noir, print blanc sur tissu devenu clair), l'encre neutre est inversée.
Si le tissu devient rouge, l'encre rouge passe en blanc cassé.
Dépendances : numpy, Pillow.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

NOIR, ROUGE, GRIS, GRIS_CLAIR = "#161616", "#a3121b", "#8a8986", "#b3b1ac"
ANTHRACITE, SABLE, CREME, ROSE, BORDEAUX = "#3b3a38", "#c6b8a4", "#ebe6dc", "#d6a99b", "#5a1219"

# slug -> [(id, couleur)] : coloris à générer (le coloris d'origine existe déjà)
VARIANTS = {
    "no-pasaran": [("rouge", ROUGE), ("gris", GRIS)],
    "sale-epoque": [("noir", NOIR), ("rose", ROSE)],
    "pas-dociles": [("rouge", ROUGE), ("gris", GRIS)],
    "human-first": [("sable", SABLE), ("gris-clair", GRIS_CLAIR)],
    "egalite-radicale": [("noir", NOIR), ("gris", GRIS)],
    "contre-ordre": [("anthracite", ANTHRACITE), ("gris", GRIS)],
    "systeme-toxique": [("noir", NOIR), ("sable", SABLE)],
    "triple-force": [("rouge", ROUGE), ("gris", GRIS)],
    "anti-raciste-toujours": [("noir", NOIR), ("creme", CREME)],
    "plus-d-amour": [("bordeaux", BORDEAUX), ("gris-clair", GRIS_CLAIR)],
    "memes-luttes": [("noir", NOIR), ("gris", GRIS)],
    "un-autre-monde": [("noir", NOIR), ("sable", SABLE)],
}

def hex2rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)

def lum(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114

def is_red(c):
    r, g, b = c
    return r > 1.6 * max(g, b) and r > 70

def fabric_base(rgb, alpha):
    px = rgb[alpha > 200]
    return np.median(px, axis=0)

def fabric_mask(rgb, base):
    L = lum(rgb); Lb = lum(base)
    chroma = rgb - L[..., None]; cb = base - Lb
    dchroma = np.abs(chroma - cb).max(axis=-1)
    neutral = np.abs(cb).max() < 12
    tolC = 16 if neutral else 34
    if Lb < 70:
        lo, hi = -60, 70
    elif Lb > 170:
        lo, hi = -75, 30
    else:
        lo, hi = -55, 55
    m = (dchroma < tolC) & (L > Lb + lo) & (L < Lb + hi)
    soft = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    return np.asarray(soft).astype(np.float32) / 255

def recolor(img, base, target):
    arr = np.asarray(img).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3]
    m = fabric_mask(rgb, base)[..., None]
    L = lum(rgb); Lb = lum(base); Lt = lum(target)
    # ombrage conservé : écart de luminance rapporté au contraste disponible
    gain = 1.15 if Lb < 70 and Lt > 120 else (0.55 if Lb > 170 and Lt < 70 else 1.0)
    shaded = np.clip(target + ((L - Lb) * gain)[..., None], 0, 255)
    ink = rgb.copy()
    ink_L = lum(ink)
    ink_chroma = ink.max(axis=-1) - ink.min(axis=-1)
    neutral_ink = (ink_chroma < 40)[..., None]
    if (Lb < 90 and Lt > 150) or (Lb > 150 and Lt < 90):
        inv = 255 - ink_L
        # inversion de l'encre neutre, teintée vers le blanc cassé / l'encre noire de la marque
        tint = np.where(inv[..., None] > 127, np.array([242, 240, 234], np.float32) * (inv[..., None] / 255),
                        np.array([22, 22, 22], np.float32) + inv[..., None] * 0.9)
        ink = np.where(neutral_ink, tint, ink)
    if is_red(target):
        reds = ((rgb[..., 0] > 1.5 * np.maximum(rgb[..., 1], rgb[..., 2])) & (rgb[..., 0] > 90))[..., None]
        ink = np.where(reds, np.array([242, 240, 234], np.float32) * (ink_L[..., None] / 200).clip(0.75, 1), ink)
    out = shaded * m + ink * (1 - m)
    return Image.fromarray(np.dstack([out, a]).astype(np.uint8), "RGBA")

for slug, variants in VARIANTS.items():
    front = Image.open(f"{SRC}/{slug}-front.png").convert("RGBA")
    back = Image.open(f"{SRC}/{slug}-back.png").convert("RGBA")
    fa = np.asarray(front).astype(np.float32)
    base = fabric_base(fa[..., :3], fa[..., 3])
    for cid, hexc in variants:
        t = hex2rgb(hexc)
        for side, img in (("front", front), ("back", back)):
            recolor(img, base, t).save(f"{OUT}/{slug}-{cid}-{side}.webp", "WEBP", quality=86, method=6)
    print(slug, "base", base.astype(int))
