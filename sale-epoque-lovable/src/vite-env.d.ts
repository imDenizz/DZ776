/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL publique du site (SEO). Par défaut : l'origine courante. */
  readonly VITE_SITE_URL?: string;
}
