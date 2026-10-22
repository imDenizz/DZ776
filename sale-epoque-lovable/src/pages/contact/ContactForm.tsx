
import { useState } from "react";
import { BRAND } from "@/config/brand";

const SUBJECTS = ["Question sur une pièce", "Tailles", "Collaboration", "Presse", "Autre"];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Formulaire de contact.
 * Sans service d'envoi configuré, il ouvre la messagerie de l'utilisateur avec le message pré-rempli (mailto).
 * Pour un envoi serveur (Resend, Formspree…), remplacer `send` par un POST vers une route API.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "");
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Indique ton nom ou un pseudo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Adresse e-mail invalide.";
    if (message.length < 10) next.message = "Ton message est un peu court (10 caractères minimum).";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }

    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(`[${subject}] ${BRAND.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = "mt-2 w-full border-b-2 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-ink/30 focus:border-militant";

  return (
    <form onSubmit={send} noValidate className="space-y-8">
      <div>
        <label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Nom ou pseudo
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-err" : undefined}
          className={`${field} ${errors.name ? "border-militant" : "border-ink"}`}
        />
        {errors.name && (
          <p id="name-err" className="mt-2 text-sm text-militant">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.2em]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-err" : undefined}
          className={`${field} ${errors.email ? "border-militant" : "border-ink"}`}
        />
        {errors.email && (
          <p id="email-err" className="mt-2 text-sm text-militant">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="subject" className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Sujet
        </label>
        <select id="subject" name="subject" className={`${field} cursor-pointer border-ink`}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-err" : undefined}
          className={`${field} resize-y ${errors.message ? "border-militant" : "border-ink"}`}
        />
        {errors.message && (
          <p id="message-err" className="mt-2 text-sm text-militant">
            {errors.message}
          </p>
        )}
      </div>
      <button type="submit" className="flex h-14 w-full items-center justify-between bg-ink px-6 font-display text-xl uppercase tracking-wide text-paper transition-colors hover:bg-militant md:w-auto md:min-w-72">
        Envoyer <span aria-hidden="true">→</span>
      </button>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50" role="status">
        {sent
          ? "Ta messagerie s'est ouverte avec le message pré-rempli. Si rien ne s'est passé, écris-nous directement à l'adresse indiquée."
          : "L'envoi ouvre ta messagerie avec le message pré-rempli."}
      </p>
    </form>
  );
}
