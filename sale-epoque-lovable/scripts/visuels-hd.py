"""
Prépare des visuels HD fournis en paires (devant à gauche, dos à droite, fond transparent).

    python3 scripts/visuels-hd.py <dossier de sortie PNG> slug=fichier.webp [slug=fichier.webp …]

Chaque paire est coupée dans la colonne vide qui sépare les deux pièces, puis chaque pièce est
cadrée dans le même repère que les autres visuels (1200 × 1650, haut du col ou de la capuche
à hauteur fixe) pour que le cintre tombe au bon endroit.
Dépendances : numpy, Pillow.
"""
import sys
import numpy as np
from PIL import Image

HOODIES = {"no-pasaran", "pas-dociles", "contre-ordre", "triple-force", "memes-luttes"}
W, H = 1200, 1650  # même ratio que le repère SVG (400 × 550)

def frame(img, hoodie):
    a = np.asarray(img)[..., 3]
    ys, xs = np.where(a > 16)
    img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    top = 240 if hoodie else 315
    s = min(1110 / img.width, (1628 - top) / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(img, ((W - img.width) // 2, top), img)
    return canvas

out = sys.argv[1]
for arg in sys.argv[2:]:
    slug, path = arg.split("=", 1)
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im)[..., 3]
    cols = (a > 16).sum(axis=0)
    w = a.shape[1]
    # colonne la plus vide dans le tiers central = séparation devant / dos
    mid = np.arange(w // 3, 2 * w // 3)
    cut = int(mid[np.argmin(cols[mid])])
    front, back = im.crop((0, 0, cut, im.height)), im.crop((cut, 0, w, im.height))
    for name, part in (("front", front), ("back", back)):
        frame(part, slug in HOODIES).save(f"{out}/{slug}-{name}.png")
    print(slug, "coupe x =", cut, "occupation", int(cols[cut]))
