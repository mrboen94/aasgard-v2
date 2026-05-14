import type {
  CanvasSettingValue,
  CanvasSettings,
  LabelColor
} from "./canvasExperiment";

export type CanvasExperimentModule = {
  default?: import("./canvasExperiment").CanvasExperimentMount;
  mount?: import("./canvasExperiment").CanvasExperimentMount;
};

export type RuntimeScene = {
  ariaLabel?: string;
  id: string;
  imageSrc?: string;
  label: string;
  script: string;
};

export type PresetOption = {
  label: string;
  settings: Partial<CanvasSettings>;
  value: string;
};

export type LinkGroup = {
  button?: HTMLButtonElement;
  enabled: boolean;
  links: import("./canvasExperiment").CanvasSettingsLink[];
};

export function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Canvas experiment data could not be parsed.", error);
    return fallback;
  }
}

export function readControlValue(
  control: HTMLInputElement | HTMLSelectElement
): CanvasSettingValue {
  if (control instanceof HTMLInputElement && control.type === "checkbox") {
    return control.checked;
  }

  if (control instanceof HTMLInputElement && control.type === "radio") {
    return control.value;
  }

  if (
    control instanceof HTMLInputElement &&
    (control.type === "number" || control.type === "range")
  ) {
    return Number.parseFloat(control.value);
  }

  return control.value;
}

export function valuesMatch(
  currentValue: CanvasSettingValue | undefined,
  nextValue: CanvasSettingValue
) {
  return currentValue === nextValue;
}

export function labelColorClass(labelColor?: LabelColor) {
  return `canvas-label-color canvas-label-color--${labelColor?.type ?? "default"}`;
}

export function applyLabelColor(element: HTMLElement, labelColor?: LabelColor) {
  element.className = labelColorClass(labelColor);

  if (labelColor?.type === "custom") {
    element.style.setProperty("--canvas-label-color-custom", labelColor.value);
  }
}

export function formatDisplayValue(value: CanvasSettingValue, unit?: string) {
  return `${value}${unit ? ` ${unit}` : ""}`;
}
