# Astro website skeleton implementation plan

This plan is intended for an AI coding agent. It assumes a fresh branch where the old code will be deleted and a new website skeleton will be created from scratch.

The goal is not final design or finished content. The goal is a working, clean Astro skeleton with typed content, demo posts, project cards, technology icons, font wiring, and enough structure to begin styling and migrating existing blogposts.

## Build target

Create a new **Astro 6 static website skeleton** with Git-versioned content, demo MDX posts, reusable layout primitives, article-local interactive components, technology icons, project cards, typography wiring, and placeholders for photography and video sections.

Astro 6 requires **Node 22.12.0 or higher**, so the skeleton should set that explicitly in `.nvmrc`.

Use Astro content collections as the content foundation because they support typed, queryable local content and can load Markdown, MDX, Markdoc, YAML, TOML, JSON, and remote content through `content.config.ts`.

Source: https://docs.astro.build/en/guides/upgrade-to/v6/

## Stack to scaffold

Use this stack:

```txt
Astro 6
TypeScript strict
@astrojs/mdx
astro-expressive-code
astro-icon
@iconify-json/simple-icons
@iconify-json/devicon
@astrojs/rss
Pagefind
Plain CSS with design tokens
No React dependency by default
No Sanity
No Tailwind initially
```

Astro MDX supports rendering content collection entries and passing custom component mappings into the rendered `<Content />` component. This gives a practical path for custom prose components now and a later custom markup renderer.

Source: https://docs.astro.build/en/guides/integrations-guide/mdx/

Expressive Code uses Shiki by default and provides syntax highlighting for Markdown and MDX code fences without needing a client framework.

Source: https://expressive-code.com/key-features/syntax-highlighting/

## Initial commands

Use `pnpm` unless the repository standard says otherwise.

```bash
echo "22.12.0" > .nvmrc

pnpm create astro@latest . -- --template minimal --typescript strict

pnpm add @astrojs/mdx astro-expressive-code astro-icon @iconify-json/simple-icons @iconify-json/devicon @astrojs/rss

pnpm add -D typescript @astrojs/check pagefind
```

Then add scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build && pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

Pagefind is suitable because it indexes static HTML after build and serves a static search bundle without hosted search infrastructure.

Source: https://pagefind.app/

## Required directory structure

Create this structure:

```txt
src/
  assets/
    fonts/
      README.md
    images/
      placeholders/
        article-cover.svg
        photo-cover.svg
        video-cover.svg

  components/
    article/
      ArticleCard.astro
      ArticleHeader.astro
      ArticleList.astro
      ArticleMeta.astro
      ArticleProse.astro
      ArticleTemplate.astro
      TechnicalArticleTemplate.astro
      InteractiveArticleTemplate.astro

    content/
      Callout.astro
      Aside.astro
      Figure.astro
      LinkCard.astro
      CodeNote.astro
      DemoFrame.astro

    icons/
      IconBadge.astro
      TechIcon.astro
      TechIconList.astro

    lab/
      ExperimentCard.astro
      CanvasShell.astro

    layout/
      BaseLayout.astro
      Head.astro
      Header.astro
      Footer.astro
      Section.astro
      SkipLink.astro

    media/
      PhotoGrid.astro
      PhotoProjectCard.astro
      VideoEmbed.astro
      VideoProjectCard.astro

    project/
      ProjectCard.astro
      ProjectGrid.astro

  content/
    articles/
      demo-standard-article/
        index.mdx
      demo-technical-article/
        index.mdx
      demo-interactive-canvas/
        index.mdx
        components/
          ParticleCanvas.astro
        sketches/
          particles.ts

    experiments/
      demo-canvas-prototype/
        index.mdx
        components/
          PrototypeCanvas.astro
        sketches/
          prototype.ts

    work/
      glittertind/
        index.mdx
      glassburet/
        index.mdx
      lesesalen/
        index.mdx

    photo-projects/
      demo-photo-project/
        index.mdx

    video-projects/
      demo-video-project/
        index.mdx

  data/
    site.ts
    technology-registry.ts

  icons/
    projects/
      glittertind.svg
      glassburet.svg
      lesesalen.svg
    custom/
      placeholder.svg

  lib/
    content/
      collections.ts
      sort.ts
      urls.ts
    icons/
      resolveTechnology.ts
    seo/
      metadata.ts

  pages/
    index.astro
    articles/
      index.astro
      [slug].astro
    lab/
      index.astro
      [slug].astro
    work/
      index.astro
      [slug].astro
    photography/
      index.astro
      [slug].astro
    video/
      index.astro
      [slug].astro
    search.astro
    rss.xml.ts

  styles/
    global.css
    tokens.css
    typography.css
    utilities.css

content.config.ts
astro.config.ts
```

Astro treats `src/components`, `src/layouts`, `src/styles`, and `public` as common conventions rather than mandatory folders, so this structure can stay pragmatic without fighting the framework.

Source: https://docs.astro.build/en/basics/project-structure/

## Astro config

Configure:

```txt
@astrojs/mdx
astro-expressive-code
astro-icon
@astrojs/rss endpoint support
static output
site URL placeholder
local fonts only if font files exist
```

Do not add a UI framework integration yet. Astro loads client JavaScript only for explicitly interactive islands. Vanilla scripts inside Astro components can be processed with TypeScript support, import bundling, module output, deduplication, and automatic inlining when small.

Sources:

- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/client-side-scripts/

## Content collections

Create `src/content.config.ts` with five collections:

```txt
articles
experiments
work
photoProjects
videoProjects
```

Use explicit glob loaders. Do not rely on implicit legacy conventions.

Each collection should use `index.mdx` files inside folders. The folder is for article-local components, sketches, images, and notes. The glob pattern should target only `**/index.{md,mdx}` so component files beside an article are not treated as content entries.

Core article schema:

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const article = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    published: z.boolean().default(true),
    template: z.enum(["standard", "technical", "interactive"]).default("standard"),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    cover: z.string().optional(),
    canonical: z.string().optional()
  })
});
```

Create similar schemas for experiments, work, photo projects, and video projects. Use `slug` from frontmatter for URLs instead of deriving URLs from file paths. That gives freedom to reorganize folders later.

## Routes

Create these routes:

```txt
/                     Landing page with section previews
/articles             Article index
/articles/[slug]      Article detail route with template switch
/lab                  Experiments, games, prototypes
/lab/[slug]           Experiment detail route
/work                 Project and experience cards
/work/[slug]          Project detail route
/photography          Photo project index
/photography/[slug]   Photo project detail route
/video                Video project index
/video/[slug]         Video project detail route
/search               Static Pagefind search
/rss.xml              Article RSS feed
```

The route files should not contain much markup. They should call query helpers from `src/lib/content/collections.ts`, sort helpers from `src/lib/content/sort.ts`, and URL helpers from `src/lib/content/urls.ts`.

## Article templates

Create a single article route that chooses a template based on frontmatter:

```txt
standard     Essay, review, nontechnical writing
technical    Technical article with code, callouts, diagrams
interactive  Article with one or more local demos, canvas components, or prototypes
```

The difference should be structural only. Styling remains minimal.

`ArticleTemplate.astro` should render:

```txt
BaseLayout
ArticleHeader
ArticleMeta
ArticleProse
Content
```

`TechnicalArticleTemplate.astro` should add:

```txt
wider prose width option
table of contents placeholder
code-heavy spacing hooks
related technologies row
```

`InteractiveArticleTemplate.astro` should add:

```txt
full-width demo region support
warning if demo needs JavaScript
article-local component support
```

MDX can import Astro components and images, and Astro image components are usable in MDX when imported.

Source: https://docs.astro.build/en/guides/images/

## Demo article requirements

Create three demo articles.

First, `demo-standard-article/index.mdx`:

````mdx
---
title: "A standard article"
slug: "standard-article"
description: "A plain prose article used to test typography."
date: 2026-01-01
template: "standard"
tags: ["writing"]
technologies: []
---

This is a standard article. It should test paragraphs, headings, lists, blockquotes, links, inline code, and images.
````

Second, `demo-technical-article/index.mdx`:

````mdx
---
title: "A technical article"
slug: "technical-article"
description: "A code-heavy article used to test syntax highlighting and technical components."
date: 2026-01-02
template: "technical"
tags: ["typescript", "astro"]
technologies: ["astro", "typescript"]
---

import Callout from "../../../components/content/Callout.astro";

<Callout title="Purpose">
This article exists to test code blocks, callouts, and technology metadata.
</Callout>

```ts
type Point = {
  x: number;
  y: number;
};

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
```
````

Third, `demo-interactive-canvas/index.mdx`:

````mdx
---
title: "An interactive canvas article"
slug: "interactive-canvas"
description: "An article-local canvas demo."
date: 2026-01-03
template: "interactive"
tags: ["canvas", "prototype"]
technologies: ["typescript", "html5"]
---

import ParticleCanvas from "./components/ParticleCanvas.astro";

This article imports a component that belongs only to this article.

<ParticleCanvas />
````

The local `ParticleCanvas.astro` should use a `<canvas>` element and import `../sketches/particles.ts` from a component script. Keep it vanilla TypeScript.

## Experiment section

Create `experiments` as first-class content, not as hidden project pages.

Experiment frontmatter should include:

```txt
title
slug
description
date
status: prototype | stable | archived
technologies
interactive: true | false
repository optional
externalUrl optional
```

Demo experiment:

````mdx
---
title: "Canvas prototype"
slug: "canvas-prototype"
description: "A standalone lab prototype."
date: 2026-01-04
status: "prototype"
technologies: ["typescript", "html5"]
interactive: true
---

import PrototypeCanvas from "./components/PrototypeCanvas.astro";

<PrototypeCanvas />
````

The lab page should feel structurally separate from articles. Articles explain things. Lab entries show things.

## Work and project cards

Create the work collection to support cards like the attached screenshot:

```txt
logo
title
description
link
technologies
featured
accent optional
```

Example `src/content/work/glittertind/index.mdx`:

````mdx
---
title: "Glittertind"
slug: "glittertind"
description: "An app made to track points in a hiking competition."
date: 2024-01-01
featured: true
logo: "projects/glittertind"
link:
  label: "Glittertind"
  href: "https://example.com"
technologies:
  - flutter
  - dart
  - figma
  - firebase
---

Placeholder project body.
````

The `ProjectCard.astro` should render:

```txt
logo badge
title
description
link row
technology icon row
optional featured variant
```

Keep the card unstyled except for necessary layout classes and semantic markup.

## Icons and logos

Use **Astro Icon** as the icon layer. It supports custom local SVG files in `/src/icons/`, references those files by slug, supports Iconify open source icon sets through `@iconify-json/*`, and allows mixing local icons with installed icon sets.

Source: https://www.astroicon.dev/getting-started/

Use local SVGs for project logos:

```txt
src/icons/projects/glittertind.svg
src/icons/projects/glassburet.svg
src/icons/projects/lesesalen.svg
```

Reference them as:

```astro
<Icon name="projects/glittertind" />
```

Use Iconify sources for technology icons. `Devicon` is a set for programming languages, design tools, and development tools, and it supports SVG usage.

Source: https://devicon.dev/

Use `simple-icons` where a brand is missing from Devicon or where a monochrome mark is preferable.

Create `src/data/technology-registry.ts`:

```ts
export type Technology = {
  id: string;
  label: string;
  icon: string;
  url?: string;
  color?: string;
};

export const technologies = {
  astro: {
    id: "astro",
    label: "Astro",
    icon: "simple-icons:astro"
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    icon: "devicon:typescript"
  },
  javascript: {
    id: "javascript",
    label: "JavaScript",
    icon: "devicon:javascript"
  },
  html5: {
    id: "html5",
    label: "HTML5",
    icon: "devicon:html5"
  },
  css3: {
    id: "css3",
    label: "CSS3",
    icon: "devicon:css3"
  },
  react: {
    id: "react",
    label: "React",
    icon: "devicon:react"
  },
  tailwindcss: {
    id: "tailwindcss",
    label: "Tailwind CSS",
    icon: "devicon:tailwindcss"
  },
  figma: {
    id: "figma",
    label: "Figma",
    icon: "devicon:figma"
  },
  firebase: {
    id: "firebase",
    label: "Firebase",
    icon: "devicon:firebase"
  },
  flutter: {
    id: "flutter",
    label: "Flutter",
    icon: "devicon:flutter"
  },
  dart: {
    id: "dart",
    label: "Dart",
    icon: "devicon:dart"
  },
  nextjs: {
    id: "nextjs",
    label: "Next.js",
    icon: "devicon:nextjs"
  },
  sanity: {
    id: "sanity",
    label: "Sanity",
    icon: "simple-icons:sanity"
  },
  vercel: {
    id: "vercel",
    label: "Vercel",
    icon: "simple-icons:vercel"
  },
  vscode: {
    id: "vscode",
    label: "Visual Studio Code",
    icon: "devicon:vscode"
  }
} satisfies Record<string, Technology>;
```

Create `TechIcon.astro` to accept a technology ID, resolve it through the registry, and render an accessible icon badge. Unknown IDs should render a generic local placeholder icon and a visible label in development.

## Fonts

Create a font system that works even before the actual font files are copied in.

Expected fonts:

```txt
Nure variable font       Main typography
Departure Mono           Accent, metadata, labels, details
Pragmata Pro Mono Liga   Code blocks, inline code, ligature icons
```

Create `src/assets/fonts/README.md`:

```txt
Place licensed webfont files here.

Expected names:
- NureVariable.woff2
- DepartureMono.woff2
- PragmataProMonoLiga.woff2

Do not commit proprietary font files to a public repository unless the license allows redistribution.
```

If the files exist, configure Astro’s local Fonts API in `astro.config.ts`. Astro supports local font files, CSS variables, variable font weight ranges, and the `<Font />` component in the page head.

Source: https://docs.astro.build/en/guides/fonts/

Use CSS variables either way:

```css
:root {
  --font-main: var(--font-nure, system-ui, sans-serif);
  --font-accent: var(--font-departure-mono, ui-monospace, monospace);
  --font-code: var(--font-pragmata-pro, ui-monospace, monospace);
}

body {
  font-family: var(--font-main);
}

code,
pre,
kbd,
samp {
  font-family: var(--font-code);
  font-feature-settings: "liga" 1, "calt" 1;
}

.meta,
.eyebrow,
.detail,
.tech-label {
  font-family: var(--font-accent);
}
```

Preload only the main text font at first. Astro’s font docs recommend preloading sparingly because preloading can block other important resources.

Source: https://docs.astro.build/en/guides/fonts/

## Photography and video skeleton

Photography should use local project folders and Astro image components. Astro provides `<Image />`, `<Picture />`, Markdown image processing, SVG component imports, and build-time image optimization for local images.

Source: https://docs.astro.build/en/guides/images/

Create demo photo project frontmatter:

````mdx
---
title: "Demo photo project"
slug: "demo-photo-project"
description: "A placeholder photography project."
date: 2026-01-05
cover: "/src/assets/images/placeholders/photo-cover.svg"
camera: "Placeholder camera"
location: "Placeholder location"
---

This is placeholder copy for a photo project.
````

Create `PhotoGrid.astro` with static placeholder slots. Do not build a complex lightbox yet.

For video, create a lightweight `VideoEmbed.astro` that accepts:

```txt
provider: youtube | vimeo | mux | local
id
title
poster optional
```

For now, render a poster placeholder and a link. Do not load iframes on the index page.

Astro does not provide native video optimization and recommends hosted video services for optimization and streaming demands.

Source: https://docs.astro.build/en/guides/images/

## Search

Create `/search` with the Pagefind UI loaded only on that page. Keep search out of the global layout.

Add `data-pagefind-body` to the main content wrapper of article, lab, work, photography, and video pages. Use `data-pagefind-meta` attributes for title, date, tags, and section.

## RSS

Create `src/pages/rss.xml.ts` using `@astrojs/rss` and the articles collection only. Astro’s RSS package supports feed generation for content websites and can use content collections.

Source: https://docs.astro.build/en/recipes/rss/

RSS item shape:

```txt
title
description
pubDate
link
categories from tags
```

Do not include full MDX-rendered article content in RSS for the first skeleton.

## Future custom markup language

Do not build the custom markup language now. Create a seam so it can replace MDX later.

Add these files:

```txt
src/lib/content/collections.ts
src/lib/content/urls.ts
src/lib/content/sort.ts
```

All pages should get normalized entries through these helpers instead of calling `getCollection()` everywhere.

Later path:

```txt
content-source/
  articles/
    my-post/index.aas

scripts/
  compile-content.ts

src/generated-content/
  articles/
    my-post/index.mdx
```

The later compiler should convert the custom markup to MDX or HTML before Astro content collections read it. That avoids turning the first skeleton into a custom build system.

## Component behavior rules

The agent should follow these rules:

```txt
Use Astro components for static UI.
Use vanilla TypeScript for canvas demos.
Do not install React, Preact, Solid, Svelte, or Vue in the base skeleton.
Do not create a design system beyond small primitives.
Do not create a CMS adapter.
Do not create a complex animation framework.
Do not create a lightbox yet.
Do not create a custom markup compiler yet.
Do not put article-local demos into global components unless at least two articles need them.
```

## Acceptance criteria

The skeleton is done when:

```txt
pnpm build passes.
pnpm preview serves all routes.
No React dependency exists in package.json.
Home page shows preview sections for articles, lab, work, photography, and video.
Article index shows three demo articles.
Each article template renders.
The interactive article renders a canvas demo.
Lab page renders one standalone experiment.
Work page renders three project cards with logo badges and technology icons.
Technology icons come from a registry, not from hardcoded card markup.
Local project logos render through astro-icon from src/icons/projects.
Font variables exist and the site still builds if font files are absent.
Search page exists and works after build.
RSS feed exists at /rss.xml.
Unknown technology IDs do not crash the build.
```

## Recap

| Area | Decision |
|---|---|
| Framework | Astro 6 |
| Content | Local MDX through content collections |
| Blog templates | Standard, technical, interactive |
| Interactive demos | Article-local Astro components with vanilla TypeScript |
| Code blocks | Expressive Code |
| Icons | Astro Icon, local SVGs, Simple Icons, Devicon |
| Fonts | Nure main, Departure Mono accent, Pragmata Pro code |
| Photography | Project collection plus Astro image components |
| Video | Lightweight embed skeleton |
| Search | Pagefind |
| CMS | None |
| Future custom markup | Compile to generated MDX later |

## Source links

- Astro 6 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v6/
- Astro project structure: https://docs.astro.build/en/basics/project-structure/
- Astro MDX integration: https://docs.astro.build/en/guides/integrations-guide/mdx/
- Astro islands: https://docs.astro.build/en/concepts/islands/
- Astro client-side scripts: https://docs.astro.build/en/guides/client-side-scripts/
- Astro images: https://docs.astro.build/en/guides/images/
- Astro fonts: https://docs.astro.build/en/guides/fonts/
- Astro RSS recipe: https://docs.astro.build/en/recipes/rss/
- Expressive Code syntax highlighting: https://expressive-code.com/key-features/syntax-highlighting/
- Astro Icon: https://www.astroicon.dev/getting-started/
- Devicon: https://devicon.dev/
- Pagefind: https://pagefind.app/
