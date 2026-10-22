import { useEffect } from "react";
import { BRAND } from "@/config/brand";

/** Titre et description de la page (équivalent client des métadonnées Next.js). */
export function useSeo({ title, description, noindex = false }: { title?: string; description?: string; noindex?: boolean }) {
  useEffect(() => {
    document.title = title ? `${title} — ${BRAND.name}` : `${BRAND.name} — Streetwear underground. ${BRAND.tagline}`;
    setMeta("description", description ?? BRAND.description);
    setMeta("robots", noindex ? "noindex" : "index, follow");
  }, [title, description, noindex]);
}

function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}
