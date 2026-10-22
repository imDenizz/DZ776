/**
 * Passage en caisse.
 *
 * Le panier est revalidé côté serveur (produits, coloris, tailles, quantités, prix recalculés).
 * Tant qu'aucun prestataire n'est configuré, la route répond 501 : aucune commande
 * n'est simulée ni enregistrée.
 *
 * Brancher Stripe Checkout :
 *   1. npm i stripe
 *   2. définir STRIPE_SECRET_KEY
 *   3. remplacer le bloc « Prestataire » par :
 *        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *        const session = await stripe.checkout.sessions.create({
 *          mode: "payment",
 *          line_items: items.map((i) => ({
 *            quantity: i.qty,
 *            price_data: { currency: "eur", unit_amount: i.unitPrice * 100,
 *              product_data: { name: `${i.name} — ${i.colorway} — ${i.size}` } },
 *          })),
 *          success_url: `${BRAND.siteUrl}/commande/merci`,
 *          cancel_url: `${BRAND.siteUrl}/shop`,
 *        });
 *        return Response.json({ url: session.url });
 *   Pour Shopify : créer un panier via la Storefront API (cartCreate) et renvoyer `checkoutUrl`.
 */
import { MAX_QTY, SIZES } from "@/data/products";
import { getProduct } from "@/lib/catalog";

type IncomingLine = { slug?: unknown; colorwayId?: unknown; size?: unknown; qty?: unknown };

export async function POST(req: Request) {
  let body: { lines?: IncomingLine[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ message: "Requête invalide." }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length || lines.length > 50) {
    return Response.json({ message: "Ton panier est vide." }, { status: 400 });
  }

  const items = [];
  for (const l of lines) {
    const product = typeof l.slug === "string" ? getProduct(l.slug) : undefined;
    const colorway = product?.colorways.find((c) => c.id === l.colorwayId);
    const size = SIZES.find((s) => s === l.size);
    const qty = Number(l.qty);
    if (!product || !colorway || !size || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return Response.json({ message: "Un article du panier n'est plus valide. Retire-le et réessaie." }, { status: 422 });
    }
    items.push({ slug: product.slug, name: product.name, colorway: colorway.name, size, qty, unitPrice: product.price });
  }

  /* ---- Prestataire ---- */
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      {
        message:
          "Le paiement en ligne n'est pas encore ouvert : ce site est un prototype et aucune commande n'est encaissée. Ton panier reste sauvegardé sur cet appareil.",
        total: items.reduce((s, i) => s + i.unitPrice * i.qty, 0),
      },
      { status: 501 },
    );
  }

  return Response.json(
    { message: "Clé de paiement détectée mais l'intégration n'est pas encore codée (voir src/app/api/checkout/route.ts)." },
    { status: 501 },
  );
}
