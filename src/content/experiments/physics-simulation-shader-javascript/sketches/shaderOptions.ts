import type { CanvasSettings } from "../../../../components/lab/canvasExperiment";
import {
  readBooleanSetting,
  readNumberSetting,
  readStringSetting
} from "../../../../lib/canvasExperiment/settings";

export type FieldMode = "repel" | "orbit" | "wind";

export type ShaderOptions = {
  cohesion: number;
  collisions: boolean;
  contain: boolean;
  density: number;
  force: number;
  friction: number;
  gravity: boolean;
  mode: FieldMode;
  particleGap: number;
  particleSize: number;
  sizeJitter: number;
  trails: boolean;
  turbulence: number;
  viewportPadding: number;
};

export function settingsToOptions(settings: CanvasSettings): ShaderOptions {
  return {
    cohesion: readNumberSetting(settings, "cohesion", 0.1),
    collisions: readBooleanSetting(settings, "collisions", false),
    contain: readBooleanSetting(settings, "contain", false),
    density: readNumberSetting(settings, "density", 9),
    force: readNumberSetting(settings, "force", 170),
    friction: readNumberSetting(settings, "friction", 0.12),
    gravity: readBooleanSetting(settings, "gravity", false),
    mode: readMode(settings),
    particleGap: readNumberSetting(settings, "particleGap", 0),
    particleSize: readNumberSetting(settings, "particleSize", 2.5),
    sizeJitter: readNumberSetting(settings, "sizeJitter", 0.05),
    trails: readBooleanSetting(settings, "trails", false),
    turbulence: readNumberSetting(settings, "turbulence", 0.35),
    viewportPadding: readNumberSetting(settings, "viewportPadding", 0)
  };
}

export function getViewportPadding(
  options: ShaderOptions,
  width: number,
  height: number
) {
  const maxPadding = Math.max(0, Math.min(width, height) * 0.5 - 1);
  return Math.min(Math.max(0, options.viewportPadding), maxPadding);
}

export function modeToNumber(mode: FieldMode) {
  if (mode === "orbit") return 1;
  if (mode === "wind") return 2;
  return 0;
}

function readMode(settings: CanvasSettings): FieldMode {
  return readStringSetting(
    settings,
    "mode",
    ["orbit", "wind", "repel"] as const,
    "repel"
  );
}
