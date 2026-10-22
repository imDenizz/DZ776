"""
Sépare plusieurs pièces qui se chevauchent sur une même image (fond transparent).

    python3 scripts/separer-groupe.py image.webp <dossier PNG> spec.json

spec.json : liste ordonnée de gauche à droite des pièces et des zones de chevauchement :
  {"pieces": ["memes-luttes-front", …],
   "seams": [{"x": [470, 640], "hidden": "left"}, …]}   # hidden : pièce masquée par sa voisine
Entre deux pièces voisines, une couture verticale de coût minimal suit les contours (fort gradient)
dans la zone donnée. La partie masquée de la pièce cachée est reconstruite par symétrie autour de
l'axe de son col. Les pièces sont ensuite cadrées comme scripts/visuels-hd.py.
Dépendances : numpy, Pillow.
"""
import json
import sys
import numpy as np
from PIL import Image, ImageFilter

HOODIES = {"no-pasaran", "pas-dociles", "contre-ordre", "triple-force", "memes-luttes"}
W, H = 1200, 1650

def seam(rgb, alpha, x0, x1):
    g = rgb.mean(axis=2)
    g = np.asarray(Image.fromarray(g.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    gx = np.abs(np.diff(g, axis=1, append=g[:, -1:]))
    gy = np.abs(np.diff(g, axis=0, append=g[-1:, :]))
    cost = 1.0 / (1.0 + gx + 0.4 * gy)
    cost[alpha < 16] = 0.0
    c = cost[:, x0:x1]; h, w = c.shape
    acc = c.copy(); back = np.zeros((h, w), int)
    for y in range(1, h):
        prev = acc[y - 1]
        cand = np.stack([np.r_[np.inf, np.inf, prev[:-2]], np.r_[np.inf, prev[:-1]], prev, np.r_[prev[1:], np.inf], np.r_[prev[2:], np.inf, np.inf]])
        k = cand.argmin(axis=0)
        acc[y] += cand[k, np.arange(w)]
        back[y] = np.arange(w) + k - 2
    xs = np.zeros(h, int); xs[-1] = int(acc[-1].argmin())
    for y in range(h - 1, 0, -1):
        xs[y - 1] = np.clip(back[y, xs[y]], 0, w - 1)
    return xs + x0

def frame(arr, hoodie):
    img = Image.fromarray(arr.astype(np.uint8), "RGBA")
    a = arr[..., 3]
    ys, xs = np.where(a > 16)
    img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    top = 240 if hoodie else 315
    s = min(1110 / img.width, (1628 - top) / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(img, ((W - img.width) // 2, top), img)
    return canvas

src, out, spec_path = sys.argv[1:4]
spec = json.load(open(spec_path))
arr = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
rgb, alpha = arr[..., :3], arr[..., 3]
h, w = alpha.shape
X = np.arange(w)[None, :]
bounds = [np.zeros(h, int)] + [seam(rgb, alpha, *s["x"]) for s in spec["seams"]] + [np.full(h, w, int)]

pieces = []
for i, name in enumerate(spec["pieces"]):
    m = (X >= bounds[i][:, None]) & (X < bounds[i + 1][:, None]) & (alpha[..., None][..., 0] > 0)
    pieces.append(m)

for i, name in enumerate(spec["pieces"]):
    m = pieces[i]
    piece = np.zeros_like(arr)
    piece[m] = arr[m]
    # symétrie : la pièce masquée récupère, côté couture, le reflet de son côté opposé
    hidden = None
    if i > 0 and spec["seams"][i - 1]["hidden"] == "right":
        hidden = "left"  # cette pièce est masquée à gauche par sa voisine
    if i < len(spec["pieces"]) - 1 and spec["seams"][i]["hidden"] == "left":
        hidden = "right"
    if hidden:
        ys, xs = np.where(m)
        top = ys.min()
        band = m[top: top + max(12, int((ys.max() - top) * 0.06))]
        tx = np.where(band.any(axis=0))[0]
        axis = (tx.min() + tx.max()) / 2
        for y in range(h):
            row = np.where(m[y])[0]
            if not len(row):
                continue
            rng = range(bounds[i + 1][y], w) if hidden == "right" else range(bounds[i][y] - 1, -1, -1)
            for x in rng:
                mx = int(round(2 * axis - x))
                if 0 <= mx < w and m[y, mx]:
                    piece[y, x] = arr[y, mx] if alpha[y, mx] > 0 else 0
                else:
                    break
    a = Image.fromarray(piece[..., 3].astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    piece[..., 3] = np.asarray(a)
    slug = name.rsplit("-", 1)[0]
    frame(piece, slug in HOODIES).save(f"{out}/{name}.png")
    print(name, "masquée" if hidden else "", hidden or "")
