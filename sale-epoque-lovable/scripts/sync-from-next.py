"""
Recopie le code partagé de ../sale-epoque (Next.js) vers cette version Vite/Lovable.

    python3 scripts/sync-from-next.py

Partagé (copié + adapté) : src/components, src/config, src/data, src/lib, la feuille de style,
la transition de page. Propre à chaque version (jamais écrasé ici) : src/lib/router.tsx,
src/lib/seo.ts, src/lib/checkout.ts, src/pages/*, src/App.tsx, src/main.tsx.
Adaptations : imports next/* → @/lib/router, directives "use client" retirées,
variables d'environnement Next → Vite.
"""
import pathlib
import re
import shutil

HERE = pathlib.Path(__file__).resolve().parent.parent
NEXT = HERE.parent / "sale-epoque"
KEEP = {"src/lib/router.tsx", "src/lib/seo.ts", "src/lib/checkout.ts"}


def adapt(text: str) -> str:
    text = re.sub(r'^"use client";\n\n?', "", text)
    text = text.replace('from "next/link";', 'from "@/lib/router";')
    text = text.replace('from "next/navigation";', 'from "@/lib/router";')
    # Fusionne `import Link from "@/lib/router"` et `import { … } from "@/lib/router"`
    named = re.search(r'^import \{ ([^}]+) \} from "@/lib/router";\n', text, re.M)
    if named and 'import Link from "@/lib/router";' in text:
        text = text.replace(named.group(0), "")
        text = text.replace('import Link from "@/lib/router";', f'import Link, {{ {named.group(1)} }} from "@/lib/router";')
    text = text.replace(
        'process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"',
        'import.meta.env.VITE_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "")',
    )
    return text


count = 0
for sub in ("components", "config", "data", "lib"):
    for src in (NEXT / "src" / sub).rglob("*"):
        if not src.is_file():
            continue
        rel = src.relative_to(NEXT)
        if str(rel) in KEEP:
            continue
        dst = HERE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(adapt(src.read_text()))
        count += 1

(HERE / "src/index.css").write_text((NEXT / "src/app/globals.css").read_text())
tpl = adapt((NEXT / "src/app/template.tsx").read_text()).replace("export default function Template(", "export function PageTransition(")
(HERE / "src/components/layout/PageTransition.tsx").write_text(tpl)

for d in ("products",):
    shutil.copytree(NEXT / "public" / d, HERE / "public" / d, dirs_exist_ok=True)

print(f"{count} fichiers synchronisés depuis {NEXT.name}/")
