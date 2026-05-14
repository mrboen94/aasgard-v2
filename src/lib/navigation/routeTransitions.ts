import { resolveRouteTransitionDirection } from "./links";

function isHeaderNavigation(sourceElement: Element | null | undefined) {
  return sourceElement instanceof Element && Boolean(sourceElement.closest(".site-header"));
}

function syncNavigationForTransition(event: Event) {
  const transition = event as Event & {
    direction: string;
    from: URL;
    navigationType: string;
    sourceElement?: Element | null;
    to: URL;
  };

  transition.direction = resolveRouteTransitionDirection(
    transition.from.pathname,
    transition.to.pathname,
    isHeaderNavigation(transition.sourceElement) ? "header" : "content"
  );
}

export function mountRouteTransitionSync() {
  const navigationWindow = window as Window & { __aasgardNavigationCleanup?: () => void };
  navigationWindow.__aasgardNavigationCleanup?.();

  const navigationController = new AbortController();
  const { signal } = navigationController;

  document.addEventListener("astro:before-preparation", syncNavigationForTransition, { signal });

  navigationWindow.__aasgardNavigationCleanup = () => {
    navigationController.abort();
  };
}
