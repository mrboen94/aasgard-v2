import { site } from "../../data/site";

export function pageTitle(title?: string) {
  if (!title || title === site.title) {
    return site.title;
  }

  return `${title} | ${site.title}`;
}

export function canonicalUrl(pathname = "/") {
  return new URL(pathname, site.url).toString();
}
