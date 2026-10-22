import Link from "@/lib/router";
import { useParams } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import NotFound from "./NotFound";
import { LEGAL_PAGES, getLegalPage } from "@/data/legal";
import { Footer } from "@/components/layout/Footer";

export default function LegalPage() {
  const page = getLegalPage(useParams().slug ?? "");
  useSeo({ title: page?.title ?? "Information", noindex: true });
  if (!page) return <NotFound />;
  return (
    <>
      <section className="px-4 pb-24 pt-[calc(var(--header-h)+3rem)] md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Informations</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,9vw,6rem)] uppercase leading-[0.9]">{page.title}</h1>
          <p className="mt-6 text-lg">{page.intro}</p>
          <div role="note" className="mt-8 border-2 border-dashed border-militant p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-militant">Emplacement à compléter</p>
            <p className="mt-2 text-sm text-ink/80">
              Cette page est une structure de travail. Le texte définitif doit être rédigé avant l&apos;ouverture des ventes.
            </p>
          </div>
          <ol className="mt-12 space-y-10">
            {page.sections.map((s, i) => (
              <li key={s.title}>
                <h2 className="font-display text-3xl uppercase">
                  <span className="mr-3 font-mono text-sm text-militant">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <p className="mt-2 text-ink/70">{s.todo}</p>
              </li>
            ))}
          </ol>
          <nav aria-label="Autres informations" className="mt-16 flex flex-wrap gap-2 border-t border-ink pt-6">
            {LEGAL_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <Link key={p.slug} href={`/infos/${p.slug}`} className="rounded-full border border-ink/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-ink hover:text-paper">
                {p.title}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <Footer />
    </>
  );
}
