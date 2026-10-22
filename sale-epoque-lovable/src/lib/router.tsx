/**
 * Petite couche de navigation au-dessus de react-router.
 * Les composants gardent une API proche de Next.js (href, usePathname…),
 * ce qui facilite les allers-retours entre les deux versions du site.
 */
import type { AnchorHTMLAttributes } from "react";
import { Link as RRLink, useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router-dom";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export default function Link({ href, ...rest }: LinkProps) {
  return <RRLink to={href} {...rest} />;
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useRRSearchParams()[0];
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string, _opts?: { scroll?: boolean }) => navigate(href),
    replace: (href: string, _opts?: { scroll?: boolean }) => navigate(href, { replace: true, preventScrollReset: true }),
    back: () => navigate(-1),
  };
}
