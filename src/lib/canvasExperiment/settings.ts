import type {
  CanvasSettings,
  CanvasSettingValue
} from "../../components/lab/canvasExperiment";

export function readBooleanSetting(
  settings: CanvasSettings,
  key: string,
  fallback: boolean
) {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
}

export function readNumberSetting(
  settings: CanvasSettings,
  key: string,
  fallback: number
) {
  const value = settings[key];
  return typeof value === "number" ? value : fallback;
}

export function readStringSetting<T extends string>(
  settings: CanvasSettings,
  key: string,
  allowedValues: readonly T[],
  fallback: T
) {
  const value = settings[key];

  return isAllowedString(value, allowedValues) ? value : fallback;
}

function isAllowedString<T extends string>(
  value: CanvasSettingValue | undefined,
  allowedValues: readonly T[]
): value is T {
  return typeof value === "string" && allowedValues.includes(value as T);
}
