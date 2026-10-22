import { Component, useLayoutEffect, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Marquee } from "@/components/layout/Marquee";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Providers } from "@/components/layout/Providers";
import { PageTransition } from "@/components/layout/PageTransition";
import HomePage from "@/pages/Home";
import ShopPage from "@/pages/Shop";
import ProductPage from "@/pages/Product";
import ManifestePage from "@/pages/Manifeste";
import ContactPage from "@/pages/Contact";
import LegalPage from "@/pages/Legal";
import NotFound from "@/pages/NotFound";

/** Remonte en haut de page à chaque changement de page (pas lors d'un simple changement de filtre). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/produit/:slug" element={<ProductPage />} />
        <Route path="/manifeste" element={<ManifestePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/infos/:slug" element={<LegalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="flex min-h-[calc(100svh-var(--marquee-h))] flex-col items-center justify-center px-4 pt-[var(--header-h)] text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-militant">Erreur</p>
        <h1 className="mt-4 font-display text-[clamp(3.5rem,12vw,9rem)] uppercase leading-[0.85]">Quelque chose a lâché.</h1>
        <p className="mt-6 max-w-md text-ink/70">Un problème est survenu en affichant cette page.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 flex h-12 items-center bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-militant"
        >
          Recharger
        </button>
      </section>
    );
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <ScrollToTop />
        <Header />
        <main id="contenu">
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>
        <CartDrawer />
        <Marquee />
      </Providers>
    </BrowserRouter>
  );
}
