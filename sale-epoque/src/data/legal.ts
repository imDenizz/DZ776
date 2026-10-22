/**
 * Pages d'informations légales — EMPLACEMENTS À COMPLÉTER.
 * Les rubriques listent ce que chaque page doit contenir ; le texte définitif
 * doit être rédigé (idéalement relu par un·e juriste) avant toute vente.
 */
export type LegalPage = { slug: string; title: string; intro: string; sections: { title: string; todo: string }[] };

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    intro: "Identification de l'éditeur et de l'hébergeur du site.",
    sections: [
      { title: "Éditeur du site", todo: "Raison sociale ou nom, forme juridique, adresse, SIRET, numéro de TVA, directeur·rice de la publication." },
      { title: "Hébergeur", todo: "Nom, adresse et téléphone de l'hébergeur (ex. Vercel Inc.)." },
      { title: "Propriété intellectuelle", todo: "Droits sur les visuels, slogans, logos et textes." },
      { title: "Contact", todo: "Adresse e-mail et/ou postale de contact." },
    ],
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    intro: "Données collectées, finalités et droits (RGPD).",
    sections: [
      { title: "Données collectées", todo: "Aujourd'hui : uniquement le panier, stocké dans ton navigateur (localStorage). Aucun cookie de suivi." },
      { title: "Finalités et bases légales", todo: "Commandes, service client, newsletter éventuelle." },
      { title: "Durées de conservation", todo: "À définir par catégorie de données." },
      { title: "Sous-traitants", todo: "Hébergeur, prestataire de paiement (Stripe / Shopify), transporteur." },
      { title: "Tes droits", todo: "Accès, rectification, effacement, opposition, portabilité, réclamation auprès de la CNIL." },
    ],
  },
  {
    slug: "retours",
    title: "Retours & échanges",
    intro: "Conditions de retour, d'échange et de remboursement.",
    sections: [
      { title: "Droit de rétractation", todo: "14 jours minimum à compter de la réception (Code de la consommation)." },
      { title: "Procédure", todo: "Comment demander un retour, adresse, état des articles." },
      { title: "Frais de retour", todo: "À la charge de qui, montant." },
      { title: "Remboursement", todo: "Délai et moyen de remboursement." },
    ],
  },
  {
    slug: "cgv",
    title: "Conditions générales de vente",
    intro: "Le contrat entre la boutique et toi.",
    sections: [
      { title: "Objet et champ d'application", todo: "Vente en ligne de vêtements aux particuliers." },
      { title: "Prix", todo: "Prix TTC en euros, frais de livraison." },
      { title: "Commande et paiement", todo: "Étapes de la commande, moyens de paiement acceptés, sécurisation." },
      { title: "Livraison", todo: "Zones, délais, transporteurs." },
      { title: "Garanties légales", todo: "Garantie légale de conformité et des vices cachés." },
      { title: "Médiation et litiges", todo: "Médiateur de la consommation, droit applicable." },
    ],
  },
];

export const getLegalPage = (slug: string) => LEGAL_PAGES.find((p) => p.slug === slug);
