export function mountCodeTabs() {
  document.querySelectorAll<HTMLElement>("[data-code-tabs]").forEach((root) => {
    if (root.dataset.mounted === "true") return;
    root.dataset.mounted = "true";

    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));

    function activate(nextPanelId: string) {
      panels.forEach((panel) => {
        panel.hidden = panel.id !== nextPanelId;
      });

      root.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((tab) => {
        tab.setAttribute("aria-selected", tab.getAttribute("aria-controls") === nextPanelId ? "true" : "false");
      });
    }

    panels.forEach((panel) => {
      const header = panel.querySelector<HTMLElement>(".expressive-code figure.frame.has-title > figcaption.header");

      if (!header) return;

      header.replaceChildren();
      header.setAttribute("role", "tablist");
      header.setAttribute("aria-label", "Code files");

      panels.forEach((targetPanel) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "code-tabs__tab";
        tab.id = `${targetPanel.id}-tab`;
        tab.setAttribute("aria-controls", targetPanel.id);
        tab.setAttribute("aria-selected", targetPanel === panel ? "true" : "false");
        tab.setAttribute("role", "tab");
        tab.textContent = targetPanel.dataset.codeTabLabel || "";
        tab.addEventListener("click", () => activate(targetPanel.id));
        header.append(tab);
      });
    });
  });
}
