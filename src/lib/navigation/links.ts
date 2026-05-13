export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/articles/", label: "Articles" },
  { href: "/lab/", label: "Lab" },
  { href: "/work/", label: "Work" },
  { href: "/photography/", label: "Photography" },
  { href: "/video/", label: "Video" },
  { href: "/search/", label: "Search" }
];

const NAV_SECTION_ORDER: readonly string[] = ["/", ...NAV_LINKS.map((link) => link.href)];

function withTrailingSlash(value: string): string {
  if (!value) return "/";
  return value.endsWith("/") ? value : `${value}/`;
}

export function isLinkActive(href: string, pathname: string): boolean {
  const normalizedPath = withTrailingSlash(pathname);
  if (href === "/") {
    return normalizedPath === "/";
  }
  const normalizedHref = withTrailingSlash(href);
  return normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref);
}

export function routeSectionIndex(pathname: string): number {
  const normalized = withTrailingSlash(pathname);
  if (normalized === "/") {
    return 0;
  }
  const index = NAV_SECTION_ORDER.findIndex((section) => section !== "/" && normalized.startsWith(section));
  return index === -1 ? 0 : index;
}
