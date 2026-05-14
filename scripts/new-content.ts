import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type ContentKind = "article" | "experiment" | "photo" | "video" | "work";

type ScaffoldResult = {
  files: string[];
  route: string;
};

const CONTENT_TYPES: Record<string, ContentKind> = {
  article: "article",
  articles: "article",
  experiment: "experiment",
  experiments: "experiment",
  lab: "experiment",
  photo: "photo",
  photography: "photo",
  "photo-project": "photo",
  "photo-projects": "photo",
  project: "work",
  video: "video",
  videos: "video",
  "video-project": "video",
  "video-projects": "video",
  work: "work"
};

const CONTENT_ROOT_BY_KIND: Record<ContentKind, string> = {
  article: "src/content/articles",
  experiment: "src/content/experiments",
  photo: "src/content/photo-projects",
  video: "src/content/video-projects",
  work: "src/content/work"
};

const ROUTE_ROOT_BY_KIND: Record<ContentKind, string> = {
  article: "/articles",
  experiment: "/lab",
  photo: "/photography",
  video: "/video",
  work: "/work"
};

const rl = createInterface({ input, output });
const projectRoot = process.cwd();

try {
  const result = await run();
  printResult(result);
} catch (error) {
  output.write(`\n${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  rl.close();
}

async function run(): Promise<ScaffoldResult> {
  const kind = await askKind();
  const title = await askRequired("Title");
  const slug = await askSlug(title);
  const description = await askRequired("Description");
  const date = await ask("Date", today());
  const targetDir = path.join(projectRoot, CONTENT_ROOT_BY_KIND[kind], slug);

  if (await exists(targetDir)) {
    throw new Error(`Content already exists at ${relativePath(targetDir)}.`);
  }

  await mkdir(targetDir, { recursive: true });

  switch (kind) {
    case "article":
      return scaffoldArticle(targetDir, slug, title, description, date);
    case "experiment":
      return scaffoldExperiment(targetDir, slug, title, description, date);
    case "photo":
      return scaffoldPhoto(targetDir, slug, title, description, date);
    case "video":
      return scaffoldVideo(targetDir, slug, title, description, date);
    case "work":
      return scaffoldWork(targetDir, slug, title, description, date);
  }
}

async function scaffoldArticle(
  targetDir: string,
  slug: string,
  title: string,
  description: string,
  date: string
): Promise<ScaffoldResult> {
  const template = await askChoice("Template", ["standard", "technical", "interactive"], "standard");
  const eyebrow = await ask("Eyebrow", defaultArticleEyebrow(template));
  const tags = await askList("Tags");
  const technologies = await askList("Technologies");
  const cover = await ask("Cover path");
  const canonical = await ask("Canonical URL");
  const frontmatter = [
    field("title", title),
    field("slug", slug),
    field("description", description),
    `date: ${date}`,
    "published: false",
    field("template", template),
    field("eyebrow", eyebrow),
    arrayField("tags", tags),
    arrayField("technologies", technologies),
    optionalField("cover", cover),
    optionalField("canonical", canonical)
  ];
  const body = [
    frontmatterBlock(frontmatter),
    "",
    "Start writing here."
  ].join("\n");
  const files = [await writeContentFile(targetDir, "index.mdx", body)];

  return { files, route: routeFor("article", slug) };
}

function defaultArticleEyebrow(template: "standard" | "technical" | "interactive") {
  const labels = {
    standard: "Blogpost",
    technical: "Technical article",
    interactive: "Interactive article"
  };

  return labels[template];
}

async function scaffoldWork(
  targetDir: string,
  slug: string,
  title: string,
  description: string,
  date: string
): Promise<ScaffoldResult> {
  const technologies = await askList("Technologies");
  const logo = await ask("Logo icon", "custom/placeholder");
  const accent = await ask("Accent CSS value", "var(--color-link)");
  const featured = await askBoolean("Featured", false);
  const linkHref = await ask("Project link URL");
  const linkLabel = linkHref ? await ask("Project link label", title) : "";
  const frontmatter = [
    field("title", title),
    field("slug", slug),
    field("description", description),
    `date: ${date}`,
    `featured: ${featured}`,
    optionalField("logo", logo),
    optionalField("accent", accent),
    linkHref && linkLabel
      ? ["link:", `  label: ${yamlString(linkLabel)}`, `  href: ${yamlString(linkHref)}`].join("\n")
      : "",
    arrayField("technologies", technologies)
  ];
  const body = [
    frontmatterBlock(frontmatter),
    "",
    "Project summary, process notes, outcomes, and links go here."
  ].join("\n");
  const files = [await writeContentFile(targetDir, "index.mdx", body)];

  return { files, route: routeFor("work", slug) };
}

async function scaffoldExperiment(
  targetDir: string,
  slug: string,
  title: string,
  description: string,
  date: string
): Promise<ScaffoldResult> {
  const status = await askChoice("Status", ["prototype", "stable", "archived"], "prototype");
  const technologies = await askList("Technologies", "typescript, canvas");
  const repository = await ask("Repository URL");
  const externalUrl = await ask("External URL");
  const componentBaseName = pascalCase(slug);
  const componentName = componentBaseName.endsWith("Experiment")
    ? componentBaseName
    : `${componentBaseName}Experiment`;
  const frontmatter = [
    field("title", title),
    field("slug", slug),
    field("description", description),
    `date: ${date}`,
    field("status", status),
    arrayField("technologies", technologies),
    "interactive: true",
    optionalField("repository", repository),
    optionalField("externalUrl", externalUrl)
  ];
  const indexBody = [
    frontmatterBlock(frontmatter),
    "",
    `import ${componentName} from "./components/${componentName}.astro";`,
    "",
    "## Result",
    "",
    `<${componentName} />`,
    "",
    "## Notes",
    "",
    "Start writing about the idea, controls, implementation, and what you learned."
  ].join("\n");
  const componentBody = experimentComponentTemplate(slug, title);
  const sketchBody = experimentSketchTemplate();
  const files = [
    await writeContentFile(targetDir, "index.mdx", indexBody),
    await writeContentFile(targetDir, `components/${componentName}.astro`, componentBody),
    await writeContentFile(targetDir, "sketches/sketch.ts", sketchBody),
    await writeContentFile(targetDir, "images/.gitkeep", "")
  ];

  return { files, route: routeFor("experiment", slug) };
}

async function scaffoldPhoto(
  targetDir: string,
  slug: string,
  title: string,
  description: string,
  date: string
): Promise<ScaffoldResult> {
  const cover = await ask("Cover path");
  const camera = await ask("Camera");
  const location = await ask("Location");
  const frontmatter = [
    field("title", title),
    field("slug", slug),
    field("description", description),
    `date: ${date}`,
    optionalField("cover", cover),
    optionalField("camera", camera),
    optionalField("location", location)
  ];
  const body = [
    frontmatterBlock(frontmatter),
    "",
    "Photo essay notes, context, and selected images go here."
  ].join("\n");
  const files = [
    await writeContentFile(targetDir, "index.mdx", body),
    await writeContentFile(targetDir, "images/.gitkeep", "")
  ];

  return { files, route: routeFor("photo", slug) };
}

async function scaffoldVideo(
  targetDir: string,
  slug: string,
  title: string,
  description: string,
  date: string
): Promise<ScaffoldResult> {
  const provider = await askChoice("Provider", ["youtube", "vimeo", "mux", "local"], "youtube");
  const videoId = await askRequired("Video ID or local path");
  const poster = await ask("Poster path");
  const frontmatter = [
    field("title", title),
    field("slug", slug),
    field("description", description),
    `date: ${date}`,
    field("provider", provider),
    field("videoId", videoId),
    optionalField("poster", poster)
  ];
  const body = [
    frontmatterBlock(frontmatter),
    "",
    "Video notes, production context, credits, or embeds go here."
  ].join("\n");
  const files = [await writeContentFile(targetDir, "index.mdx", body)];

  return { files, route: routeFor("video", slug) };
}

async function askKind(): Promise<ContentKind> {
  const options = "article, work/project, lab/experiment, photo, video";

  while (true) {
    const answer = normalizeInput(await ask(`Type (${options})`));
    const kind = CONTENT_TYPES[answer];

    if (kind) return kind;

    output.write(`Unknown type. Choose one of: ${options}.\n`);
  }
}

async function askRequired(label: string) {
  while (true) {
    const answer = await ask(label);

    if (answer) return answer;

    output.write(`${label} is required.\n`);
  }
}

async function askSlug(title: string) {
  const generated = slugify(title);

  while (true) {
    const answer = await ask("Slug", generated);
    const slug = slugify(answer);

    if (slug) return slug;

    output.write("Slug must contain at least one letter or number.\n");
  }
}

async function ask(label: string, defaultValue = "") {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || defaultValue;
}

async function askBoolean(label: string, defaultValue: boolean) {
  const defaultLabel = defaultValue ? "y" : "n";

  while (true) {
    const answer = normalizeInput(await ask(`${label} (y/n)`, defaultLabel));

    if (["y", "yes", "true"].includes(answer)) return true;
    if (["n", "no", "false"].includes(answer)) return false;

    output.write("Answer y or n.\n");
  }
}

async function askChoice<const T extends readonly string[]>(
  label: string,
  options: T,
  defaultValue: T[number]
): Promise<T[number]> {
  while (true) {
    const answer = normalizeInput(await ask(`${label} (${options.join("/")})`, defaultValue));

    if (options.includes(answer)) return answer;

    output.write(`Choose one of: ${options.join(", ")}.\n`);
  }
}

async function askList(label: string, defaultValue = "") {
  const answer = await ask(`${label} (comma separated)`, defaultValue);
  return answer
    .split(",")
    .map((item) => normalizeInput(item))
    .filter(Boolean);
}

async function writeContentFile(baseDir: string, relativeFile: string, content: string) {
  const filePath = path.join(baseDir, relativeFile);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);

  return relativePath(filePath);
}

function experimentComponentTemplate(slug: string, title: string) {
  return [
    "---",
    "import CanvasExperiment from \"../../../../components/lab/CanvasExperiment.astro\";",
    "import type { CanvasSettingsTree } from \"../../../../components/lab/canvasExperiment\";",
    "",
    "const settings = [",
    "  {",
    "    children: [",
    "      {",
    "        id: \"speed\",",
    "        label: \"Speed\",",
    "        max: 3,",
    "        min: 0.1,",
    "        showValue: true,",
    "        step: 0.1,",
    "        type: \"range\",",
    "        value: 1",
    "      },",
    "      {",
    "        id: \"showGuides\",",
    "        label: \"Guides\",",
    "        type: \"checkbox\",",
    "        value: true",
    "      }",
    "    ],",
    "    id: \"controls\",",
    "    label: \"Controls\",",
    "    layout: \"grid\",",
    "    type: \"group\",",
    "    variant: \"box\"",
    "  }",
    "] satisfies CanvasSettingsTree;",
    "---",
    "",
    "<CanvasExperiment",
    `  ariaLabel=${yamlString(`Interactive ${title} experiment`)}`,
    `  script="/src/content/experiments/${slug}/sketches/sketch.ts"`,
    "  settings={settings}",
    "/>"
  ].join("\n");
}

function experimentSketchTemplate() {
  return [
    "import type { CanvasExperimentMount } from \"../../../../components/lab/canvasExperiment\";",
    "import { observeResize, resizeCanvasToDisplaySize } from \"../../../../lib/canvas/resize\";",
    "",
    "export const mount: CanvasExperimentMount = ({ canvas, onSettingsChange, setReady, settings }) => {",
    "  const context = canvas.getContext(\"2d\");",
    "",
    "  if (!context) return;",
    "",
    "  const canvasContext = context;",
    "  let frameId = 0;",
    "  const startedAt = performance.now();",
    "",
    "  function readNumber(key: string, fallback: number) {",
    "    const value = settings[key];",
    "    return typeof value === \"number\" ? value : fallback;",
    "  }",
    "",
    "  function readBoolean(key: string, fallback: boolean) {",
    "    const value = settings[key];",
    "    return typeof value === \"boolean\" ? value : fallback;",
    "  }",
    "",
    "  function render(now = performance.now()) {",
    "    const { height, pixelRatio, width } = resizeCanvasToDisplaySize(canvas, canvasContext);",
    "    const displayWidth = width / pixelRatio;",
    "    const displayHeight = height / pixelRatio;",
    "    const speed = readNumber(\"speed\", 1);",
    "    const showGuides = readBoolean(\"showGuides\", true);",
    "    const elapsed = ((now - startedAt) / 1000) * speed;",
    "    const radius = Math.max(18, Math.min(displayWidth, displayHeight) * 0.12);",
    "    const x = displayWidth * 0.5 + Math.cos(elapsed) * displayWidth * 0.18;",
    "    const y = displayHeight * 0.5 + Math.sin(elapsed * 1.3) * displayHeight * 0.18;",
    "",
    "    canvasContext.clearRect(0, 0, displayWidth, displayHeight);",
    "",
    "    if (showGuides) {",
    "      canvasContext.strokeStyle = \"rgba(23, 107, 135, 0.25)\";",
    "      canvasContext.lineWidth = 1;",
    "      canvasContext.beginPath();",
    "      canvasContext.moveTo(displayWidth * 0.5, 0);",
    "      canvasContext.lineTo(displayWidth * 0.5, displayHeight);",
    "      canvasContext.moveTo(0, displayHeight * 0.5);",
    "      canvasContext.lineTo(displayWidth, displayHeight * 0.5);",
    "      canvasContext.stroke();",
    "    }",
    "",
    "    canvasContext.fillStyle = \"#d75f3f\";",
    "    canvasContext.beginPath();",
    "    canvasContext.arc(x, y, radius, 0, Math.PI * 2);",
    "    canvasContext.fill();",
    "  }",
    "",
    "  function tick(now: number) {",
    "    render(now);",
    "    frameId = window.requestAnimationFrame(tick);",
    "  }",
    "",
    "  const stopResize = observeResize(canvas, () => render());",
    "  const stopSettings = onSettingsChange(() => render());",
    "",
    "  setReady();",
    "  frameId = window.requestAnimationFrame(tick);",
    "",
    "  return () => {",
    "    window.cancelAnimationFrame(frameId);",
    "    stopResize();",
    "    stopSettings();",
    "  };",
    "};",
    "",
    "export default mount;"
  ].join("\n");
}

function frontmatterBlock(lines: Array<string | false>) {
  return ["---", ...lines.filter(Boolean), "---"].join("\n");
}

function field(key: string, value: string) {
  return `${key}: ${yamlString(value)}`;
}

function optionalField(key: string, value: string) {
  return value ? field(key, value) : "";
}

function arrayField(key: string, values: string[]) {
  return `${key}: [${values.map(yamlString).join(", ")}]`;
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function routeFor(kind: ContentKind, slug: string) {
  return `${ROUTE_ROOT_BY_KIND[kind]}/${slug}/`;
}

async function exists(filePath: string) {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function relativePath(filePath: string) {
  return path.relative(projectRoot, filePath);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pascalCase(value: string) {
  return value
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function normalizeInput(value: string) {
  return value.trim().toLowerCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function printResult(result: ScaffoldResult) {
  output.write("\nCreated content scaffold:\n");
  result.files.forEach((file) => output.write(`- ${file}\n`));
  output.write(`\nPreview route: ${result.route}\n`);
}
