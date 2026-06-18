/**
 * Translated Pathnames Configuration
 *
 * This file is OPTIONAL. Only use it if you want different URL paths for different languages.
 *
 * Examples:
 * - WITH translated pathnames: /en/about vs /de/ueber
 * - WITHOUT translated pathnames: /en/about vs /de/about
 *
 * If all your routes use the same paths across languages (just different locale prefixes),
 * you can delete this file and remove the urlPatterns from vite.config.ts.
 */

import { Locale } from "@/paraglide/runtime";
import { FileRoutesByTo } from "../routeTree.gen";

type RoutePath = keyof FileRoutesByTo;

/**
 * Paths to exclude from translation (e.g., admin panels, API routes)
 */
const excludedPaths = ["admin", "docs", "api"] as const;

type PublicRoutePath = Exclude<
  RoutePath,
  `${string}${(typeof excludedPaths)[number]}${string}`
>;

type TranslatedPathname = {
  pattern: string;
  localized: Array<[Locale, string]>;
};

/**
 * Converts TanStack Router path syntax to URL pattern format
 * - Converts catch-all: /$ → /:path(.*)?
 * - Converts optional params: {-$param} → :param?
 * - Converts named params: $param → :param
 */
function toUrlPattern(path: string): string {
  return path
    .replace(/\/\$$/, "/:path(.*)?")
    .replace(/\{-\$([a-zA-Z0-9_]+)\}/g, ":$1?")
    .replace(/\$([a-zA-Z0-9_]+)/g, ":$1")
    .replace(/\/+$/, "");
}

/**
 * Creates translated pathname configuration for routing
 */
function createTranslatedPathnames(
  input: Record<PublicRoutePath, Record<Locale, string>>,
): TranslatedPathname[] {
  return Object.entries(input).map(([pattern, locales]) => ({
    pattern: toUrlPattern(pattern),
    localized: Object.entries(locales).map(
      ([locale, path]) =>
        [locale as Locale, `/${locale}${toUrlPattern(path)}`] satisfies [
          Locale,
          string,
        ],
    ),
  }));
}

/**
 * Pathname translations for all routes
 * Add your route paths here with translations for each locale
 */
export const translatedPathnames = createTranslatedPathnames({
  "/": {
    en: "/",
    de: "/",
  },
  "/about": {
    en: "/about",
    de: "/ueber",
  },
});
