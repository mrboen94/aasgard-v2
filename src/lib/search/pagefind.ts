type PagefindWindow = Window & {
  PagefindUI?: new (options: { element: string; showSubResults?: boolean }) => unknown;
};

export function mountPagefindSearch() {
  const root = document.querySelector<HTMLElement>("#search");

  if (!root || root.dataset.pagefindMounted === "true") return;

  const pagefindWindow = window as PagefindWindow;

  if (!pagefindWindow.PagefindUI) return;

  root.dataset.pagefindMounted = "true";
  new pagefindWindow.PagefindUI({ element: "#search", showSubResults: true });
}
