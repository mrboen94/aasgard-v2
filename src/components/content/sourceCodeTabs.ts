export function mountSourceCodeTabs() {
  document.querySelectorAll<HTMLElement>("[data-source-code-tabs]").forEach((root) => {
    if (root.dataset.mounted === "true") return;
    root.dataset.mounted = "true";

    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));

    function activate(nextTab: HTMLButtonElement, shouldFocus = false) {
      tabs.forEach((tab) => {
        const selected = tab === nextTab;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== nextTab.getAttribute("aria-controls");
      });

      if (shouldFocus) nextTab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

        event.preventDefault();

        const lastIndex = tabs.length - 1;
        const nextIndex =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? lastIndex
              : event.key === "ArrowRight"
                ? index === lastIndex
                  ? 0
                  : index + 1
                : index === 0
                  ? lastIndex
                  : index - 1;

        activate(tabs[nextIndex], true);
      });
    });
  });
}
