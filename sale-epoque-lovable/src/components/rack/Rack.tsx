/**
 * LE PORTANT — expérience principale de la page d'accueil.
 *
 * Desktop : tous les cintres tiennent sur une tringle, légèrement superposés.
 *   Survol / focus clavier → la pièce avance, se balance, ses voisines s'écartent.
 * Mobile : la tringle défile au doigt (scroll-snap), la pièce centrée est mise en avant.
 * Clic / Entrée / tap → la pièce quitte le portant (layoutId partagé) et s'ouvre dans <RackStage>.
 *
 * Mouvement (voir src/lib/motion.ts) :
 *  - Arrivée : la tringle se trace depuis le centre, puis les pièces tombent dessus du centre vers les bords
 *    (installation → action → retombée, cascade < 500 ms).
 *  - Survol : PRIMAIRE la pièce avance et monte ; SECONDAIRE son ombre au sol s'étale et s'adoucit,
 *    les voisines s'écartent (contre-mouvement) ; SUITE le tissu oscille puis se pose.
 *  - AMBIANCE : balancement sinusoïdal des cintres + l'affiche du mur suit le curseur à 0,2× en sens inverse.
 */
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLLECTION } from "@/config/brand";
import { formatPrice, getRackItems } from "@/lib/catalog";
import { useMediaQuery } from "@/lib/hooks";
import { DUR, EASE, SPRING, STAGGER, centerOut, enter, leave } from "@/lib/motion";
import { Garment } from "@/components/garment/Garment";
import { RackStage } from "./RackStage";

export function Rack() {
  const items = useMemo(() => getRackItems(), []);
  const n = items.length;
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpened = useRef<number | null>(null);

  const hi = hover ?? active;
  const caption = hi !== null ? items[hi] : null;

  /* Arrivée jouée une seule fois ; ensuite les cintres répondent sans délai. */
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLanded(true), 1300);
    return () => clearTimeout(t);
  }, []);

  /* Ambiance : l'affiche murale glisse à l'opposé du curseur (fond = 0,2×, 10 px max). */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const posterX = useSpring(useTransform(px, (v) => v * -10), { stiffness: 60, damping: 20 });
  const posterY = useSpring(useTransform(py, (v) => v * -6), { stiffness: 60, damping: 20 });

  /* Mobile : la pièce la plus proche du centre devient active. */
  useEffect(() => {
    const el = scroller.current;
    if (!el || !isMobile) return;
    let raf = 0;
    // Centre d'un cintre dans le repère de défilement (les items sont transformés : on passe par le rect).
    const centerOf = (b: HTMLElement) => {
      const r = b.getBoundingClientRect();
      return r.left - el.getBoundingClientRect().left + el.scrollLeft + r.width / 2;
    };
    const update = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      buttons.current.forEach((b, i) => {
        if (!b) return;
        const d = Math.abs(centerOf(b) - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    // Démarre au milieu du portant, pour montrer des pièces de chaque côté
    const start = buttons.current[Math.floor(n / 2) - 1];
    raf = requestAnimationFrame(() => {
      if (start) el.scrollLeft = centerOf(start) - el.clientWidth / 2;
      update();
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile, n]);

  const focusItem = useCallback(
    (i: number) => {
      const idx = (i + n) % n;
      setActive(idx);
      const b = buttons.current[idx];
      b?.focus({ preventScroll: true });
      b?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
    },
    [n, reduce],
  );

  const openItem = (i: number) => {
    lastOpened.current = i;
    setHover(null);
    setOpen(i);
  };

  const closeStage = useCallback(() => {
    const i = lastOpened.current;
    setOpen(null);
    if (i !== null) requestAnimationFrame(() => buttons.current[i]?.focus({ preventScroll: true }));
  }, []);

  const onStageIndex = useCallback((i: number) => {
    lastOpened.current = i;
    setActive(i);
    setOpen(i);
  }, []);

  return (
    <section
      aria-label="Portant — Collection 001"
      className="wall relative flex h-[calc(100svh-var(--marquee-h))] min-h-[560px] flex-col overflow-hidden"
      onPointerMove={(e) => {
        if (reduce || isMobile || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {/* Affiche murale en arrière-plan (couche lente) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[8%] select-none text-center font-display leading-[0.8] text-[#dcd7cb]"
        style={{ x: posterX, y: posterY }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={enter(DUR.drama * 1.5)}
      >
        <div className="text-[clamp(5rem,22vw,22rem)] tracking-tight">RIEN À</div>
        <div className="text-[clamp(5rem,22vw,22rem)] tracking-tight">TAIRE</div>
      </motion.div>

      <div
        className={`relative z-10 flex items-end justify-between px-4 pt-[calc(var(--header-h)+0.75rem)] transition-opacity duration-300 md:px-8 ${open !== null ? "opacity-0" : ""}`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/70 md:text-xs">{COLLECTION.full}</p>
        <p className="hidden font-mono text-xs uppercase tracking-[0.25em] text-ink/50 md:block">
          {String(n).padStart(2, "0")} pièces — {String(new Set(items.map((it) => it.product.slug)).size).padStart(2, "0")} modèles
        </p>
      </div>

      {/* ---- La tringle ---- */}
      <LayoutGroup>
        {/* Mise en scène : quand une pièce est décrochée, le portant recule (échelle + opacité, sans filtre coûteux). */}
        <motion.div
          className="relative z-20 flex flex-1 flex-col justify-center"
          animate={open !== null ? { opacity: 0.45, scale: 0.97 } : { opacity: 1, scale: 1 }}
          transition={open !== null ? enter(DUR.slow) : enter(DUR.slow, 0.1)}
          aria-hidden={open !== null || undefined}
          inert={open !== null}
        >
          <div
            ref={scroller}
            className="rack-row no-scrollbar relative snap-x snap-mandatory overflow-x-auto overflow-y-visible md:overflow-visible"
            style={{ ["--n" as string]: n }}
          >
            <div
              role="list"
              className="rack-track relative mx-auto flex w-max items-start pb-10 pt-4"
              onMouseLeave={() => setHover(null)}
              onKeyDown={(e) => {
                const i = buttons.current.findIndex((b) => b === document.activeElement);
                if (i < 0) return;
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  focusItem(i + 1);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  focusItem(i - 1);
                }
              }}
            >
              {/* Tringle + supports muraux */}
              {/* Tube chromé (même axe que les crochets : 4,73 % de la hauteur d'un cintre) */}
              {/* Installation : la tringle se trace depuis le centre (métal = aucun rebond). */}
              <motion.div
                aria-hidden="true"
                className="rail absolute left-3 right-3 rounded-full"
                style={{ top: "calc(1rem + var(--h) * 0.0346)", height: "calc(var(--h) * 0.0255)" }}
                initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
                animate={reduce ? { opacity: 1 } : { scaleX: 1 }}
                transition={enter(DUR.slow, 0.1)}
              />
              {/* Platines murales et embouts : se posent quand la tringle les atteint. */}
              {(["left-0", "right-0"] as const).map((side) => (
                <motion.div
                  key={side}
                  aria-hidden="true"
                  className={`absolute ${side} grid place-items-center`}
                  style={{ top: "calc(1rem + var(--h) * 0.0473)", width: "calc(var(--h) * 0.075)", height: "calc(var(--h) * 0.075)", translate: "0 -50%" }}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={enter(DUR.standard, 0.45)}
                >
                  <span className="rail-flange absolute inset-0 rounded-full" />
                  <span className="rail-cap relative block rounded-[3px]" style={{ width: "calc(var(--h) * 0.026)", height: "calc(var(--h) * 0.04)" }} />
                </motion.div>
              ))}

              {items.map((it, i) => {
                const d = hi === null ? 0 : i - hi;
                const isHi = hi === i;
                const shift = isMobile || hi === null || d === 0 ? 0 : Math.sign(d) * (Math.abs(d) === 1 ? 24 : Math.abs(d) === 2 ? 11 : 5);
                const scale = isMobile ? (isHi ? 1 : 0.9) : isHi ? 1.1 : 1;
                // Mise en scène par l'échelle et l'écartement seulement : baisser l'opacité rendrait le tissu transparent.
                const dim = 1;
                // Arrivée : chute sur la tringle, du centre vers les bords (cascade 30 ms, total ≈ 170 ms).
                const dropDelay = 0.35 + centerOut(i, n) * STAGGER.micro;
                return (
                  <motion.div
                    role="listitem"
                    key={`${it.product.slug}-${it.colorway.id}`}
                    className="rack-item relative shrink-0 snap-center"
                    style={{ zIndex: isHi ? 40 : 20 - Math.abs(i - (hi ?? (n - 1) / 2)), originX: 0.5, originY: 0.047 }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -36, rotate: i % 2 ? 2 : -2 }}
                    animate={{ x: `${shift}%`, y: 0, rotate: 0, scale, opacity: dim }}
                    transition={
                      reduce
                        ? { duration: DUR.quick }
                        : landed
                          ? { ...SPRING.fabric, opacity: { duration: DUR.quick, ease: EASE.out } }
                          : { ...SPRING.fabric, delay: dropDelay, opacity: { duration: DUR.quick, delay: dropDelay } }
                    }
                  >
                    {/* SECONDAIRE : ombre portée sur le mur, derrière la pièce. Quand la pièce s'avance,
                        l'ombre grandit, descend et s'adoucit (contre-mouvement, 50 ms après la pièce). */}
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-[16%] bottom-[6%] top-[22%] rounded-[40%] bg-[radial-gradient(closest-side,rgba(30,24,16,0.22),transparent)]"
                      initial={false}
                      animate={isHi && !isMobile ? { scale: 1.12, opacity: 0.75, x: 10, y: 18 } : { scale: 1, opacity: 0, x: 0, y: 0 }}
                      transition={isHi ? enter(DUR.standard, 0.05) : leave(DUR.standard)}
                    />
                    <button
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      className="group block w-full cursor-pointer rounded-sm focus-visible:outline-offset-[-4px]"
                      aria-label={`${it.product.name} — ${it.product.label}, ${it.colorway.name}, ${formatPrice(it.product.price)}. Ouvrir la pièce`}
                      onMouseEnter={() => !isMobile && setHover(i)}
                      onFocus={() => {
                        setActive(i);
                        setHover(null);
                      }}
                      onClick={() => openItem(i)}
                    >
                      {/* SUITE : le tissu oscille après l'impulsion du survol, amplitude décroissante, puis se pose. */}
                      <motion.div
                        className="sway"
                        style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${6 + (i % 3) * 1.2}s` }}
                        animate={isHi && !reduce && !isMobile ? { rotate: [0, -2, 1.2, -0.5, 0] } : { rotate: 0 }}
                        transition={{ duration: 1.2, ease: EASE.sine }}
                      >
                        {open === i ? (
                          <div className="aspect-[400/550] w-full" />
                        ) : (
                          <motion.div layoutId={`rack-garment-${i}`} transition={SPRING.carry} className="aspect-[400/550] w-full">
                            <Garment product={it.product} colorway={it.colorway} side="front" hanger lite decorative className="garment-shadow h-full w-full" />
                          </motion.div>
                        )}
                      </motion.div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ---- Légende ---- */}
          <div className="relative z-30 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 md:px-8">
            <button
              type="button"
              onClick={() => focusItem((hi ?? 0) - 1)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/25 text-lg transition hover:bg-ink hover:text-paper"
              aria-label="Pièce précédente"
            >
              ←
            </button>
            <div className="min-h-[5.25rem] flex-1 text-center" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {caption ? (
                  <motion.div
                    key={hi}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: enter(DUR.quick) }}
                    exit={{ opacity: 0, y: -6, transition: leave(DUR.quick) }}
                  >
                    <p className="font-display text-2xl uppercase leading-none md:text-3xl">{caption.product.name}</p>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
                      {caption.product.label} — {caption.colorway.name} — {formatPrice(caption.product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => openItem(hi!)}
                      className="mt-3 rounded-full border border-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-ink hover:text-paper"
                    >
                      Voir la pièce ↗
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: enter(DUR.slow, landed ? 0 : 0.75) }}
                    exit={{ opacity: 0, y: -6, transition: leave(DUR.quick) }}
                  >
                    <p className="font-display text-2xl uppercase leading-none md:text-3xl">Survole. Choisis. Assume.</p>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
                      Clique sur une pièce pour la décrocher — ← → au clavier
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => focusItem(hi === null ? 0 : hi + 1)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/25 text-lg transition hover:bg-ink hover:text-paper"
              aria-label="Pièce suivante"
            >
              →
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {open !== null && <RackStage items={items} index={open} onIndex={onStageIndex} onClose={closeStage} />}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
}
