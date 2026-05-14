export function mountOnAstroPageLoad(mount: () => void) {
  const mountWindow = window as Window & {
    __aasgardPageLoadMounts?: WeakSet<() => void>;
  };
  const mountedCallbacks = mountWindow.__aasgardPageLoadMounts ?? new WeakSet<() => void>();

  mountWindow.__aasgardPageLoadMounts = mountedCallbacks;
  mount();

  if (mountedCallbacks.has(mount)) return;

  document.addEventListener("astro:page-load", mount);
  mountedCallbacks.add(mount);
}
