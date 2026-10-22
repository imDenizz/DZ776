"""
Découpe la planche de visuels (4 × 3 cartes, devant + dos par carte) en 24 images détourées.

    python3 scripts/decoupe-planche.py planche.png public/products   # puis conversion en .webp

Dépendances : numpy, Pillow, opencv-python-headless (GrabCut pour les pièces crème).
Les coordonnées de grille et les séparations manuelles sont propres à la planche actuelle.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
SRC, OUT = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
COLS = [(2, 388), (393, 765), (773, 1147), (1154, 1534)]
ROWS = [(15, 284), (359, 623), (694, 950)]
SLUGS = ["no-pasaran","sale-epoque","pas-dociles","human-first","egalite-radicale","contre-ordre",
         "systeme-toxique","triple-force","anti-raciste-toujours","plus-d-amour","memes-luttes","un-autre-monde"]
LIGHT = {"sale-epoque","systeme-toxique","un-autre-monde"}
HOODIE = {"no-pasaran","pas-dociles","contre-ordre","triple-force","memes-luttes"}

def bg_mask(cell, light=False):
    h, w, _ = cell.shape
    L = cell.mean(axis=2)
    # Fond estimé ligne par ligne sur les bords de la carte, en ignorant les pixels de vêtement
    edge = np.concatenate([cell[:, :8], cell[:, -8:]], axis=1)
    eL = edge.mean(axis=2)
    ref = np.full((h, 3), np.nan, np.float32)
    for y in range(h):
        ok = (eL[y] > 150) & (eL[y] < 235)
        if ok.sum() >= 3: ref[y] = np.median(edge[y][ok], axis=0)
    good = ~np.isnan(ref[:, 0])
    for k in range(3):
        ref[:, k] = np.interp(np.arange(h), np.where(good)[0], ref[good, k])
    refL = ref.mean(axis=1)[:, None]
    diff = np.abs(cell - ref[:, None, :]).max(axis=2)
    chroma = cell.max(axis=2) - cell.min(axis=2)
    refC = (ref.max(axis=1) - ref.min(axis=1))[:, None]
    near = diff < 13
    shadow = (L < refL) & (L > refL - 75) & (np.abs(chroma - refC) < 10)
    cand = near | shadow
    if light:
        # Pièce crème : on ferme le contour (gradient dilaté) pour que le fond ne s'y infiltre pas
        blur = np.asarray(Image.fromarray(L.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32)
        gx = np.abs(np.diff(blur, axis=1, append=blur[:, -1:])); gy = np.abs(np.diff(blur, axis=0, append=blur[-1:, :]))
        edges = ((gx + gy) > 7).astype(np.uint8) * 255
        edges = np.asarray(Image.fromarray(edges).filter(ImageFilter.MaxFilter(7))) > 0
        cand = cand & ~edges
    # Le remplissage ne franchit pas les contours nets (bord d'un t-shirt crème sur le mur)
    seen = np.zeros((h, w), bool); q = deque()
    def push(y, x):
        if cand[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
    # Une manche crème peut toucher le bord de la carte : on ne part alors que du haut et du bas.
    if not light:
        for y in range(h): push(y, 0); push(y, w - 1)
    for x in range(w): push(0, x); push(h - 1, x)
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and cand[ny, nx] \
               and abs(L[ny, nx] - L[y, x]) < 6:
                seen[ny, nx] = True; q.append((ny, nx))
    fg = ~seen
    if light:
        # rend les 3 px ajoutés par la dilatation du contour
        fg = np.asarray(Image.fromarray(fg.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(5))) > 0
    # garde uniquement les grandes régions (supprime les poussières)
    lab = np.zeros((h, w), int); n = 0; keep = np.zeros((h, w), bool)
    for y0 in range(h):
        for x0 in range(w):
            if fg[y0, x0] and not lab[y0, x0]:
                n += 1; comp = [(y0, x0)]; lab[y0, x0] = n; i = 0
                while i < len(comp):
                    y, x = comp[i]; i += 1
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; comp.append((ny, nx))
                if len(comp) > 400:
                    ys, xs = zip(*comp); keep[list(ys), list(xs)] = True
    return keep

def grabcut(cell, hint):
    """Segmentation GrabCut (OpenCV) pour les pièces crème, guidée par le premier masque."""
    import cv2
    h, w, _ = cell.shape
    k = 3
    img = cv2.resize(cell[..., ::-1].astype(np.uint8), (w * k, h * k), interpolation=cv2.INTER_CUBIC)
    mask = np.zeros((h * k, w * k), np.uint8)
    bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
    rect = (2 * k, 5 * k, (w - 4) * k, (h - 12) * k)
    cv2.grabCut(img, mask, rect, bgd, fgd, 10, cv2.GC_INIT_WITH_RECT)
    out = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8) * 255
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    # bouche les trous intérieurs
    ff = out.copy(); m2 = np.zeros((h * k + 2, w * k + 2), np.uint8)
    cv2.floodFill(ff, m2, (0, 0), 255)
    out = out | cv2.bitwise_not(ff)
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_AREA) > 127

def largest(mask):
    h, w = mask.shape; lab = np.zeros((h, w), int); best = []; n = 0
    for y0 in range(h):
        for x0 in range(w):
            if mask[y0, x0] and not lab[y0, x0]:
                n += 1; comp = [(y0, x0)]; lab[y0, x0] = n; i = 0
                while i < len(comp):
                    y, x = comp[i]; i += 1
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; comp.append((ny, nx))
                if len(comp) > len(best): best = comp
    out = np.zeros_like(mask)
    if best:
        ys, xs = zip(*best); out[list(ys), list(xs)] = True
    return out

# Séparations tracées à la main là où crème sur crème rend la couture automatique peu fiable (y, x locaux).
MANUAL_SEAMS = {
    "sale-epoque": [(0, 185), (60, 185), (90, 192), (120, 201), (150, 199), (170, 188), (999, 185)],
    "systeme-toxique": [(0, 190), (60, 190), (100, 198), (130, 203), (160, 195), (175, 190), (999, 190)],
    "un-autre-monde": [(0, 184), (40, 182), (100, 186), (150, 184), (175, 185), (999, 188)],
}

def seam(cell, fg, x0, x1):
    """Couture verticale de coût minimal entre x0 et x1, qui suit les contours entre les deux pièces."""
    g = cell.mean(axis=2)
    gx = np.abs(np.diff(g, axis=1, append=g[:, -1:]))
    gy = np.abs(np.diff(g, axis=0, append=g[-1:, :]))
    grad = gx + 0.5 * gy
    cost = 1.0 / (1.0 + grad) + 0.0
    cost[~fg] = 0.0                                    # traverser le fond ne coûte rien
    h = cell.shape[0]
    c = cost[:, x0:x1].copy(); W = c.shape[1]
    acc = c.copy(); back = np.zeros_like(c, dtype=int)
    for y in range(1, h):
        prev = acc[y - 1]
        cand = np.stack([np.r_[np.inf, prev[:-1]], prev, np.r_[prev[1:], np.inf]])
        k = cand.argmin(axis=0)
        acc[y] += cand[k, np.arange(W)]
        back[y] = np.arange(W) + k - 1
    xs = np.zeros(h, int); xs[-1] = acc[-1].argmin()
    for y in range(h - 1, 0, -1): xs[y - 1] = back[y, xs[y]]
    return xs + x0

def normalize(rgba, hoodie):
    a = rgba[:, :, 3]
    ys, xs = np.where(a > 20)
    crop = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    img = Image.fromarray(crop.astype(np.uint8), "RGBA")
    W, H = 800, 1100
    top = 160 if hoodie else 210
    s = min(740 / img.width, (1085 - top) / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(img, ((W - img.width) // 2, top), img)
    return canvas

for i, slug in enumerate(SLUGS):
    r, c = divmod(i, 4)
    (cx0, cx1), (y0, y1) = COLS[c], ROWS[r]
    cell = im[y0:y1, cx0:cx1]
    h, w, _ = cell.shape
    fg = grabcut(cell, bg_mask(cell, light=True)) if slug in LIGHT else bg_mask(cell)
    # la zone de recouvrement est autour du milieu de la carte
    if slug in MANUAL_SEAMS:
        pts = MANUAL_SEAMS[slug]
        xs = np.round(np.interp(np.arange(h), [p[0] for p in pts], [p[1] for p in pts])).astype(int)
    else:
        xs = seam(cell, fg, int(w * 0.40), int(w * 0.62))
    X = np.arange(w)[None, :]
    left = largest(fg & (X <= xs[:, None]))
    right = largest(fg & (X > xs[:, None]))
    # devant : complète la partie cachée par symétrie autour de l'axe du col
    cols = np.where(left[: int(h * 0.15)].any(axis=0))[0]
    ys_, xs_ = np.where(left)
    axis = (np.percentile(xs_, 1) + np.percentile(xs_, 99)) / 2  # provisoire
    top_rows = left[: max(8, int(h * 0.12))]
    tx = np.where(top_rows.any(axis=0))[0]
    if len(tx): axis = (tx.min() + tx.max()) / 2
    front = np.zeros((h, w, 4), np.float32); front[..., :3] = cell; front[..., 3] = left * 255
    for y in range(h if slug not in LIGHT else 0):  # crème : séparation manuelle, pas de symétrie
        lx = np.where(left[y])[0]
        if not len(lx): continue
        for x in range(xs[y] + 1, w):
            m = int(round(2 * axis - x))
            if 0 <= m < w and left[y, m] and m < xs[y]:
                front[y, x, :3] = cell[y, m]; front[y, x, 3] = 255
            elif m < 0 or not left[y, max(m, 0)]:
                if x > 2 * axis - lx.min(): break
    back = np.zeros((h, w, 4), np.float32); back[..., :3] = cell; back[..., 3] = right * 255
    for name, arr in (("front", front), ("back", back)):
        alpha = arr[..., 3].astype(np.uint8)
        if slug not in LIGHT:
            # Pièce sombre : supprime le liseré clair (fond) resté le long du contour
            near_edge = np.asarray(Image.fromarray(255 - alpha).filter(ImageFilter.MaxFilter(9))) > 0
            Lp = arr[..., :3].mean(axis=2)
            alpha = np.where(near_edge & (Lp > 120), 0, alpha).astype(np.uint8)
        a = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
        arr[..., 3] = np.asarray(a)
        normalize(arr, slug in HOODIE).save(f"{OUT}/{slug}-{name}.png", optimize=True)
    print(slug, "axis", round(axis), "seam", xs.min(), xs.max())
