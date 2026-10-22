import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource/space-mono/400.css";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { Header } from "@/components/layout/Header";
import { Marquee } from "@/components/layout/Marquee";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} — Streetwear underground. ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  openGraph: {
    type: "website",
    locale: BRAND.locale,
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.description,
  },
  twitter: { card: "summary_large_image", title: BRAND.name, description: BRAND.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="grain min-h-svh">
        <Providers>
          <Header />
          <main id="contenu">{children}</main>
          <CartDrawer />
          <Marquee />
        </Providers>
      </body>
    </html>
  );
}
