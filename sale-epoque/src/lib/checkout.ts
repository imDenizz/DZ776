/**
 * Passage en caisse (version Next.js) : la validation et le refus éventuel se font
 * côté serveur dans /api/checkout. La version Lovable fournit sa propre implémentation
 * de ce module, avec la même signature.
 */
import type { CartLine } from "@/lib/cart-store";

export type CheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
    if (res.ok && data.url) return { ok: true, url: data.url };
    return { ok: false, message: data.message ?? "Le paiement est indisponible pour le moment." };
  } catch {
    return { ok: false, message: "Connexion impossible. Vérifie ta connexion et réessaie." };
  }
}
