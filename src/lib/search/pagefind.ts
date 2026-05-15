type PagefindResultData = {
  excerpt?: string;
  meta?: {
    title?: string;
  };
  title?: string;
  url: string;
};

type PagefindResult = {
  data: () => Promise<PagefindResultData>;
};

type PagefindModule = {
  search: (query: string) => Promise<{
    results: PagefindResult[];
  }>;
};

export function mountPagefindSearch() {
  const root = document.querySelector<HTMLElement>("#search");

  if (!root || root.dataset.pagefindMounted === "true") return;

  const input = root.querySelector<HTMLInputElement>("[data-pagefind-search-input]");
  const status = root.querySelector<HTMLElement>("[data-pagefind-status]");
  const results = root.querySelector<HTMLElement>("[data-pagefind-results]");

  if (!input || !status || !results) return;

  const searchInput = input;
  const statusElement = status;
  const resultsElement = results;

  root.dataset.pagefindMounted = "true";

  let pagefindPromise: Promise<PagefindModule> | undefined;
  let searchId = 0;

  function loadPagefind() {
    const pagefindPath = "/pagefind/pagefind.js";
    pagefindPromise ??= import(/* @vite-ignore */ pagefindPath) as Promise<PagefindModule>;
    return pagefindPromise;
  }

  function setStatus(message: string) {
    statusElement.textContent = message;
  }

  function clearResults() {
    resultsElement.replaceChildren();
  }

  async function renderResults(query: string) {
    const currentSearchId = ++searchId;
    const trimmedQuery = query.trim();

    clearResults();

    if (!trimmedQuery) {
      setStatus("");
      return;
    }

    setStatus("Searching...");

    try {
      const pagefind = await loadPagefind();
      const search = await pagefind.search(trimmedQuery);

      if (currentSearchId !== searchId) return;

      const data = await Promise.all(search.results.slice(0, 10).map((result) => result.data()));

      if (currentSearchId !== searchId) return;

      setStatus(`${search.results.length} result${search.results.length === 1 ? "" : "s"}`);

      data.forEach((result) => {
        const article = document.createElement("article");
        const link = document.createElement("a");
        const excerpt = document.createElement("p");

        article.className =
          "rounded-card border border-border bg-surface p-4 transition-[background-color,border-color] duration-[var(--duration-theme)] ease-theme";
        link.className = "font-accent text-primary";
        link.href = result.url;
        link.textContent = result.meta?.title ?? result.title ?? result.url;
        excerpt.className =
          "mt-2 mb-0 text-muted [&_mark]:rounded-small [&_mark]:bg-accent [&_mark]:px-1 [&_mark]:text-selection-foreground";
        excerpt.innerHTML = result.excerpt ?? "";

        article.append(link, excerpt);
        resultsElement.append(article);
      });
    } catch {
      if (currentSearchId !== searchId) return;

      setStatus("Search index unavailable.");
    }
  }

  searchInput.addEventListener("input", () => {
    window.clearTimeout(Number(root.dataset.pagefindTimer));
    root.dataset.pagefindTimer = String(
      window.setTimeout(() => renderResults(searchInput.value), 120)
    );
  });
}
