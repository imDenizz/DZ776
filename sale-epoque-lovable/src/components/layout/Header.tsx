import Link, { usePathname } from "@/lib/router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/config/brand";
import { NAV } from "@/config/nav";
import { DUR, EASE, STAGGER, enter, exitOf } from "@/lib/motion";
import { cartCount, useCart } from "@/lib/cart-store";
import { useFocusTrap, useEscape, useScrollLock } from "@/lib/hooks";

const DARK_HERO = ["/manifeste"];

export function Logo({ className }: { className?: string }) {
  const [a, b] = BRAND.wordmark;
  return (
    <span className={`flex items-center gap-2 font-display uppercase leading-[0.82] ${className ?? ""}`}>
      <span className="block h-[1.65em] w-[0.28em] bg-militant" aria-hidden="true" />
      <span className="flex flex-col">
        <span>{a}</span>
        <span>{b}</span>
      </span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const count = cartCount(lines);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Pages dont le haut est sombre : en-tête clair tant qu'on n'a pas défilé.
  const dark = !scrolled && DARK_HERO.includes(pathname);

  return (
    <>
      <a
        href="#contenu"
        className="fixed left-2 top-2 z-[80] -translate-y-20 bg-militant px-4 py-2 font-mono text-xs uppercase text-paper focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-colors duration-300 ${
          dark ? "text-paper" : "text-ink"
        } ${scrolled ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md" : ""}`}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label={`${BRAND.name} — accueil`} className="text-[1.05rem] md:text-xl">
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
            {NAV.slice(1).map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative font-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-militant transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className={`flex h-11 items-center gap-2 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.2em] transition ${
                dark ? "border-paper/60 hover:bg-paper hover:text-ink" : "border-ink bg-paper/70 backdrop-blur hover:bg-ink hover:text-paper"
              }`}
              aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
            >
              Panier
              <motion.span
                key={count}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 18 }}
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${count ? "bg-militant text-paper" : dark ? "bg-paper/15" : "bg-ink/10"}`}
              >
                {count}
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className={`flex h-11 items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-militant hover:text-paper md:hidden ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`}
              aria-expanded={menu}
              aria-controls="menu-principal"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className={`hidden h-11 w-11 place-items-center rounded-full transition hover:bg-militant hover:text-paper md:grid ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`}
              aria-label="Ouvrir le menu"
              aria-expanded={menu}
              aria-controls="menu-principal"
            >
              <span className="flex flex-col gap-[5px]" aria-hidden="true">
                <span className="block h-[2px] w-4 bg-current" />
                <span className="block h-[2px] w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>{menu && <MenuOverlay onClose={() => setMenu(false)} pathname={pathname} />}</AnimatePresence>
    </>
  );
}

function MenuOverlay({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useEscape(true, onClose);
  useFocusTrap(ref, true);

  return (
    <motion.div
      ref={ref}
      id="menu-principal"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[70] flex flex-col bg-ink text-paper"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: DUR.slow * 1.2, ease: EASE.inOut } }}
      exit={{ clipPath: "inset(100% 0 0% 0)", transition: { duration: DUR.slow * 0.8, delay: 0.1, ease: EASE.in } }}
    >
      <div className="flex h-[var(--header-h)] items-center justify-between px-4 md:px-8">
        <Logo className="text-[1.05rem] md:text-xl" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 items-center gap-2 rounded-full border border-paper/40 px-4 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:bg-paper hover:text-ink"
        >
          Fermer <span aria-hidden="true">✕</span>
        </button>
      </div>
      <nav aria-label="Menu principal" className="flex flex-1 flex-col justify-center px-4 md:px-8">
        <ul>
          {NAV.map((l, i) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href} className="overflow-hidden border-b border-paper/15">
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: 0, transition: enter(DUR.drama, 0.2 + i * STAGGER.standard) }}
                  exit={{ y: "-110%", transition: { duration: exitOf(DUR.standard), delay: (NAV.length - 1 - i) * STAGGER.micro, ease: EASE.in } }}
                >
                  <Link
                    href={l.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className="group flex items-baseline justify-between py-2 font-display text-[clamp(3.5rem,13vw,10rem)] uppercase leading-[0.95] transition-colors hover:text-militant"
                  >
                    <span className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-4">{l.label}</span>
                    <span className="font-mono text-xs tracking-[0.2em] text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="px-4 pb-[calc(var(--marquee-h)+1.5rem)] font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50 md:px-8">
        {BRAND.tagline} — {BRAND.name}
      </p>
    </motion.div>
  );
}
