/**
 * Passage en caisse.
 *
 * Le panier est revalidé contre le catalogue (produits, coloris, tailles, quantités, prix recalculés).
 * Aucun prestataire n'est branché : la fonction renvoie un refus explicite, aucune commande
 * n'est simulée ni enregistrée.
 *
 * Brancher Stripe avec Lovable : activer Supabase, créer une Edge Function « checkout » qui crée
 * une session Stripe Checkout à partir de `items` (clé secrète stockée côté Supabase, jamais ici),
 * puis remplacer le bloc « Prestataire » par :
 *   const { data, error } = await supabase.functions.invoke("checkout", { body: { items } });
 *   if (data?.url) return { ok: true, url: data.url };
 * Les prix doivent être recalculés dans la fonction serveur : ne jamais faire confiance au navigateur.
 */
import { MAX_QTY, SIZES } from "@/data/products";
import { getProduct } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart-store";

export type CheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  if (!lines.length || lines.length > 50) return { ok: false, message: "Ton panier est vide." };

  const items = [];
  for (const l of lines) {
    const product = getProduct(l.slug);
    const colorway = product?.colorways.find((c) => c.id === l.colorwayId);
    const size = SIZES.find((s) => s === l.size);
    if (!product || !colorway || !size || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY) {
      return { ok: false, message: "Un article du panier n'est plus valide. Retire-le et réessaie." };
    }
    items.push({ slug: product.slug, name: product.name, colorway: colorway.name, size, qty: l.qty, unitPrice: product.price });
  }

  /* ---- Prestataire ---- */
  return {
    ok: false,
    message:
      "Le paiement en ligne n'est pas encore ouvert : ce site est un prototype et aucune commande n'est encaissée. Ton panier reste sauvegardé sur cet appareil.",
  };
}
