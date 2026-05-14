import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../data/site";
import { getArticles } from "../lib/content/collections";
import { articleUrl } from "../lib/content/urls";

export async function GET(context: APIContext) {
  const articles = await getArticles();

  return rss({
    title: site.title,
    description: site.description,
    site: context.site?.toString() ?? site.url,
    items: articles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: articleUrl(entry.data.slug),
      categories: entry.data.tags
    }))
  });
}
