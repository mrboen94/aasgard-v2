import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export type MarkerDefinition =
  | string
  | RegExp
  | number
  | {
      label?: string;
      range: string;
    };

export type SourceCodeFrame = "auto" | "code" | "none" | "terminal";

export type SourceCodeFile = {
  collapse?: string | string[];
  del?: MarkerDefinition | MarkerDefinition[];
  file?: string;
  frame?: SourceCodeFrame;
  ins?: MarkerDefinition | MarkerDefinition[];
  lang?: string;
  mark?: MarkerDefinition | MarkerDefinition[];
  path?: string;
  range?: string;
  showLineNumbers?: boolean;
  startLineNumber?: number;
  title?: string;
  wrap?: boolean;
};

export type SourceCodeProps = SourceCodeFile & {
  files?: SourceCodeFile[];
};

export type PreparedSourceCodeFile = SourceCodeFile & {
  code: string;
  id: string;
  lang: string;
  startLineNumber: number;
  title: string;
};

export async function prepareSourceCodeFiles(
  props: SourceCodeProps,
  groupId: string
) {
  const files = props.files?.length ? props.files : [props];
  return Promise.all(files.map((file, index) => prepareFile(file, index, groupId)));
}

async function prepareFile(
  file: SourceCodeFile,
  index: number,
  groupId: string
): Promise<PreparedSourceCodeFile> {
  const filePath = file.file ?? file.path;

  if (!filePath) {
    throw new Error("SourceCode requires a `file`, `path`, or `files` entry with one of those properties.");
  }

  const resolvedPath = resolveProjectPath(filePath);
  const source = await readFile(resolvedPath, "utf8");
  const range = sliceRange(source, file.range, filePath);
  const title = file.title ?? formatTitle(filePath);

  return {
    ...file,
    code: range.code,
    collapse: normalizeRanges(file.collapse, range.startLine),
    del: normalizeMarkers(file.del, range.startLine),
    id: `${groupId}-${index}`,
    ins: normalizeMarkers(file.ins, range.startLine),
    lang: file.lang ?? inferLanguage(filePath),
    mark: normalizeMarkers(file.mark, range.startLine),
    startLineNumber: file.startLineNumber ?? range.startLine,
    title
  };
}

function resolveProjectPath(filePath: string) {
  const projectRoot = process.cwd();
  const normalizedPath =
    path.isAbsolute(filePath) && !filePath.startsWith(projectRoot)
      ? filePath.slice(1)
      : filePath;
  const resolvedPath = path.resolve(projectRoot, normalizedPath);
  const projectRootWithSeparator = `${projectRoot}${path.sep}`;

  if (resolvedPath !== projectRoot && !resolvedPath.startsWith(projectRootWithSeparator)) {
    throw new Error(`SourceCode cannot read files outside the project root: ${filePath}`);
  }

  return resolvedPath;
}

function sliceRange(source: string, range: string | undefined, filePath: string) {
  const normalizedSource = source.replace(/\r\n?/g, "\n");

  if (!range) {
    return {
      code: normalizedSource.trimEnd(),
      startLine: 1
    };
  }

  const match = /^(?:L)?(\d+)(?:\s*-\s*(?:(?:L)?(\d+))?)?$/.exec(range.trim());

  if (!match) {
    throw new Error(`Invalid SourceCode range "${range}" for ${filePath}. Use forms like "12", "12-24", or "12-".`);
  }

  const startLine = Number.parseInt(match[1], 10);
  const endLine = match[2] ? Number.parseInt(match[2], 10) : undefined;
  const lines = normalizedSource.split("\n");

  if (startLine < 1 || startLine > lines.length) {
    throw new Error(`SourceCode range "${range}" starts outside ${filePath}.`);
  }

  if (endLine !== undefined && endLine < startLine) {
    throw new Error(`SourceCode range "${range}" ends before it starts in ${filePath}.`);
  }

  return {
    code: lines.slice(startLine - 1, endLine).join("\n").trimEnd(),
    startLine
  };
}

function normalizeMarkers(
  markers: MarkerDefinition | MarkerDefinition[] | undefined,
  startLine: number
): MarkerDefinition | MarkerDefinition[] | undefined {
  if (markers === undefined) return undefined;

  if (Array.isArray(markers)) {
    return markers.map((marker) => normalizeMarker(marker, startLine));
  }

  return normalizeMarker(markers, startLine);
}

function normalizeMarker(marker: MarkerDefinition, startLine: number): MarkerDefinition {
  if (typeof marker === "number") {
    return normalizeLineNumber(marker, startLine);
  }

  if (typeof marker === "string") {
    return normalizeRangeString(marker, startLine) ?? marker;
  }

  if (marker instanceof RegExp) {
    return marker;
  }

  return {
    ...marker,
    range: normalizeRangeString(marker.range, startLine) ?? marker.range
  };
}

function normalizeRanges(ranges: string | string[] | undefined, startLine: number) {
  if (ranges === undefined) return undefined;

  if (Array.isArray(ranges)) {
    return ranges.map((range) => normalizeRangeString(range, startLine) ?? range);
  }

  return normalizeRangeString(ranges, startLine) ?? ranges;
}

function normalizeRangeString(range: string, startLine: number) {
  const match = /^(?:L)?(\d+)(?:\s*-\s*(?:L)?(\d+))?$/.exec(range.trim());

  if (!match) return undefined;

  const from = normalizeLineNumber(Number.parseInt(match[1], 10), startLine);
  const to = match[2]
    ? normalizeLineNumber(Number.parseInt(match[2], 10), startLine)
    : undefined;

  return to === undefined ? String(from) : `${from}-${to}`;
}

function normalizeLineNumber(line: number, startLine: number) {
  return line - startLine + 1;
}

function inferLanguage(filePath: string) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const languageByExtension: Record<string, string> = {
    astro: "astro",
    cjs: "js",
    css: "css",
    html: "html",
    js: "js",
    json: "json",
    jsx: "jsx",
    md: "md",
    mdx: "mdx",
    mjs: "js",
    mts: "ts",
    sh: "bash",
    ts: "ts",
    tsx: "tsx",
    wgsl: "wgsl"
  };

  return languageByExtension[extension] ?? extension;
}

function formatTitle(filePath: string) {
  return filePath.replace(/^\/+/, "");
}
