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

export function isLinkActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(href);
}

export function routeSectionIndex(pathname: string): number {
  if (pathname === "/") {
    return 0;
  }
  const index = NAV_SECTION_ORDER.findIndex((section) => section !== "/" && pathname.startsWith(section));
  return index === -1 ? 0 : index;
}
