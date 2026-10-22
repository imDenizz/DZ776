import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Footer } from "@/components/layout/Footer";
import { LineReveal, Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Manifeste",
  description: `Pourquoi ${BRAND.name} existe : du streetwear qui parle, contre le racisme, le fascisme, le sexisme et toutes les injustices.`,
};

const ARTICLES = [
  {
    title: "On ne fait pas de la déco.",
    body: "Un vêtement, c'est le premier truc qu'on lit sur toi. Avant ta voix, avant ton nom. Alors autant qu'il dise quelque chose de vrai. Nos pièces portent des phrases qu'on assume, dans le dos, en grand — là où on ne peut pas faire semblant de ne pas les voir.",
  },
  {
    title: "Antiracistes. Point.",
    body: "Personne n'est de trop. Aucun être humain n'est illégal. La couleur de peau, l'origine, la religion, l'accent ne font pas de quelqu'un un suspect. On le répète tant qu'il faudra le répéter.",
  },
  {
    title: "Antifascistes, par héritage.",
    body: "« No pasarán » n'est pas un slogan rétro. C'est une promesse transmise par celles et ceux qui ont tenu la ligne avant nous. La haine organisée ne passera pas par nos rues, nos écoles, nos scènes ni nos stades.",
  },
  {
    title: "Féministes, sans astérisque.",
    body: "Égalité réelle, salaires, sécurité, liberté de disposer de son corps, droit de prendre de la place. Les droits ne se négocient pas, ils s'élargissent.",
  },
  {
    title: "Solidaires, toujours.",
    body: "Les galères ne se règlent pas chacun dans son coin. Logement, travail, santé, dignité : on se tient. La solidarité n'est pas de la charité, c'est une stratégie.",
  },
  {
    title: "Libres, pas dociles.",
    body: "On n'est pas nés pour obéir à l'injustice. Questionner, refuser, s'organiser — pacifiquement, collectivement, joyeusement. Le silence ne change rien. Les voix, si.",
  },
];

export default function ManifestePage() {
  return (
    <>
      <section className="bg-ink px-4 pb-24 pt-[calc(var(--header-h)+4rem)] text-paper md:px-8 md:pb-36">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Manifeste — {BRAND.name}</p>
          <h1 className="mt-6 font-display text-[clamp(4rem,14vw,13rem)] uppercase leading-[0.84]">
            <LineReveal lines={["L'époque", "est sale.", <span key="r" className="text-militant">On reste</span>, <span key="d" className="text-militant">debout.</span>]} />
          </h1>
          <Reveal className="mt-14 grid gap-8 md:grid-cols-[1fr_1.4fr]" delay={0.2}>
            <p className="font-mono text-xs uppercase leading-relaxed tracking-[0.2em] text-paper/60">
              Texte fondateur
              <br />
              Collection 001 — Rien à taire
            </p>
            <p className="text-xl leading-relaxed md:text-3xl md:leading-snug">
              {BRAND.name} est né d&apos;une colère et d&apos;une envie. La colère de voir la haine se banaliser. L&apos;envie de faire des
              fringues qu&apos;on aime vraiment porter — lourdes, larges, bien coupées — et qui disent clairement de quel côté on se tient.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <ol className="mx-auto max-w-7xl">
          {ARTICLES.map((a, i) => (
            <Reveal as="li" key={a.title} className="grid gap-4 border-t border-ink py-12 md:grid-cols-[6rem_1fr_1.2fr] md:gap-10 md:py-16">
              <span className="font-mono text-sm text-militant">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-4xl uppercase leading-[0.9] md:text-6xl">{a.title}</h2>
              <p className="text-lg leading-relaxed text-ink/80">{a.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-militant px-4 py-24 text-paper md:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-display text-[clamp(3rem,10vw,9rem)] uppercase leading-[0.85]">
              Ce qu&apos;on refuse&nbsp;:
              <br />
              <span className="text-ink">la haine, la violence, les raccourcis.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 max-w-2xl text-lg leading-relaxed">
            <p>
              Nos messages visent des idées et des systèmes, jamais des personnes. On ne vend pas de la provocation creuse : on imprime des
              convictions, et on les tient. Si un jour une pièce te met mal à l&apos;aise, c&apos;est peut-être qu&apos;elle fait son travail.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            <Link href="/shop" className="flex h-12 items-center bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition hover:bg-paper hover:text-ink">
              Porter le message
            </Link>
            <Link href="/contact" className="flex h-12 items-center border border-paper px-6 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-paper hover:text-militant">
              Nous écrire
            </Link>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  );
}
