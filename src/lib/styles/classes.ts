export const containerClass = "mx-auto max-w-site px-6";

export const gridClass =
  "grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]";

export const surfaceClass =
  "rounded-card border border-border bg-surface transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-theme)] ease-theme has-[a:hover]:-translate-y-0.5 has-[a:hover]:border-[color-mix(in_srgb,var(--color-border)_55%,var(--color-primary))] has-[a:focus-visible]:-translate-y-0.5 has-[a:focus-visible]:border-[color-mix(in_srgb,var(--color-border)_55%,var(--color-primary))]";

export const visuallyHiddenClass =
  "absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0_0_0_0)] [clip-path:inset(50%)]";

export const visuallyHiddenUntilFocusClass = `${visuallyHiddenClass} font-accent text-primary transition-[color,opacity] duration-[var(--duration-fast)] ease-theme focus-visible:static focus-visible:h-auto focus-visible:w-fit focus-visible:overflow-visible focus-visible:whitespace-normal focus-visible:[clip:auto] focus-visible:[clip-path:none]`;

export const captionClass = "mt-2 font-accent text-small text-muted";

export const mediaPlaceholderClass = "bg-[var(--background-media-placeholder)]";

export const eyebrowClass =
  "m-0 font-accent text-[var(--section-accent,var(--color-accent))] uppercase no-underline transition-colors duration-[var(--duration-theme)] ease-theme";

export const detailClass = "font-accent";

export const listingCardClass = "grid gap-4 p-6";

export const listingCardLinkClass = "grid gap-2 text-inherit no-underline";

export const listingCardBodyClass = "grid gap-2";

export const listingCardDescriptionClass = "m-0 text-muted";

export const listingCardEyebrowClass =
  "font-accent text-meta uppercase text-[var(--listing-card-accent,var(--color-accent))]";

export const pageSectionClass = `${containerClass} grid gap-8 py-12`;

export const pageIntroClass = "grid gap-3 [--section-accent:var(--color-accent)]";

export const pageIntroSecondaryClass = "[--section-accent:var(--color-success)]";

export const pageIntroCopyClass = "m-0 max-w-section-copy text-muted";

export const articleShellClass = `${containerClass} min-h-screen bg-article transition-colors duration-[var(--duration-theme)] ease-theme`;

export const contentPageClass = `${articleShellClass} grid gap-6 py-12`;

export const contentHeaderClass = `${pageIntroClass} gap-4`;

export const articleHeaderClass = "grid gap-4 pt-12 pb-6";

export const articleDescriptionClass = "m-0 max-w-section-copy text-lead text-muted";

export const articleMetaClass =
  "flex flex-wrap items-center gap-x-3 gap-y-2 font-accent text-small text-muted";

export const articleMetaListClass = "m-0 flex list-none flex-wrap gap-2 p-0";

export const articleMetaTagClass = "rounded-full border border-border px-2";

export const articleProseClass =
  "w-full min-w-0 max-w-prose break-words [&_.expressive-code]:max-w-full [&_.expressive-code]:rounded-tl-none [&_canvas]:w-full [&_canvas]:rounded-card [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-4 [&_iframe]:max-w-full [&_img]:max-w-full [&_img]:rounded-card [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-tl-none [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:rounded-tl-none [&_video]:max-w-full";

export const articleProseWideClass = "max-w-prose-wide";

export const sourceCodeTabClass =
  "relative mb-[-1px] min-h-10 flex-none cursor-pointer appearance-none whitespace-nowrap rounded-t-small border border-border border-t-[0.15rem] border-t-transparent bg-code px-4 py-2 font-accent text-small leading-[1.4] text-muted aria-selected:bg-surface aria-selected:border-t-accent aria-selected:text-foreground hover:text-foreground focus-visible:text-foreground";
