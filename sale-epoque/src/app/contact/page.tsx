import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { Footer } from "@/components/layout/Footer";
import { Socials } from "@/components/layout/Socials";
import { LineReveal, Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Écrire à ${BRAND.name} : questions, collaborations, presse. FAQ et réseaux.`,
};

const FAQ = [
  {
    q: "Quand pourra-t-on commander ?",
    a: "Le site est un prototype : le panier fonctionne, mais le paiement n'est pas encore ouvert et aucune commande n'est encaissée. Le lancement sera annoncé sur nos réseaux.",
  },
  { q: "Les visuels sont-ils des photos ?", a: "Pas encore. Les pièces affichées sont des maquettes. Les photos des pièces produites les remplaceront." },
  {
    q: "Comment choisir ma taille ?",
    a: "Toute la collection est coupée oversize. Le guide des tailles (sur chaque fiche produit) donne les mesures à plat. Pour un rendu plus ajusté, prends une taille en dessous.",
  },
  { q: "Vous livrez où ?", a: "Les zones et délais de livraison seront précisés dans les conditions générales de vente avant l'ouverture des commandes." },
  {
    q: "On peut collaborer ?",
    a: "Collectifs, assos, artistes, lieux, médias : écris-nous via le formulaire en choisissant « Collaboration ». On lit tout.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="px-4 pb-24 pt-[calc(var(--header-h)+3rem)] md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-[clamp(4.5rem,16vw,12rem)] uppercase leading-[0.82]">
            <LineReveal lines={["Parle-nous", <span key="d" className="text-militant">direct.</span>]} />
          </h1>
          <div className="mt-16 grid gap-16 md:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <ContactForm />
            </Reveal>
            <Reveal delay={0.1} className="space-y-12">
              <div>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">E-mail</h2>
                <a href={`mailto:${BRAND.contactEmail}`} className="mt-2 block break-all font-display text-3xl uppercase hover:text-militant">
                  {BRAND.contactEmail}
                </a>
              </div>
              <div>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">Réseaux</h2>
                <Socials className="mt-3" tone="light" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-ink px-4 py-24 md:px-8" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_2fr]">
          <h2 id="faq-title" className="font-display text-6xl uppercase leading-none md:text-8xl">
            FAQ
          </h2>
          <div className="divide-y divide-ink/20 border-y border-ink/20">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-2xl uppercase leading-tight md:text-3xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 font-sans text-2xl transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-ink/80">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
