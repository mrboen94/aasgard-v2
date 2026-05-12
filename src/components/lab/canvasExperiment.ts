export type CanvasSettingValue = boolean | number | string;

export type LabelColor =
  | { type: "default" | "error" | "warning" }
  | { type: "custom"; value: string };

type BaseCanvasControl = {
  id: string;
  labelColor?: LabelColor;
  label: string;
};

export type CanvasRangeControl = BaseCanvasControl & {
  max: number;
  min: number;
  orientation?: "horizontal" | "vertical";
  showValue?: boolean;
  size?: "default" | "full" | "narrow" | "wide";
  step?: number;
  type: "range";
  unit?: string;
  value: number;
};

export type CanvasNumberControl = BaseCanvasControl & {
  max?: number;
  min?: number;
  step?: number;
  type: "number";
  value: number;
};

export type CanvasCheckboxControl = BaseCanvasControl & {
  type: "checkbox";
  value: boolean;
};

export type CanvasRadioControl = BaseCanvasControl & {
  options: Array<{
    label: string;
    value: string;
  }>;
  type: "radio";
  value: string;
};

export type CanvasSelectControl = BaseCanvasControl & {
  options: Array<{
    label: string;
    value: string;
  }>;
  type: "select";
  value: string;
};

export type CanvasPresetControl = BaseCanvasControl & {
  options: Array<{
    label: string;
    settings: Partial<CanvasSettings>;
    value: string;
  }>;
  placeholder?: string;
  type: "preset";
};

export type CanvasControl =
  | CanvasCheckboxControl
  | CanvasNumberControl
  | CanvasPresetControl
  | CanvasRadioControl
  | CanvasRangeControl
  | CanvasSelectControl;

export type CanvasSettings = Record<string, CanvasSettingValue>;

export type CanvasSettingsLinkTarget = {
  id: string;
  offset?: number;
  ratio?: number;
};

export type CanvasSettingsLink = {
  enabled?: boolean;
  source: string;
  targets: CanvasSettingsLinkTarget[];
};

export type CanvasGroupNode = {
  children: CanvasSettingsNode[];
  id: string;
  label: string;
  labelColor?: LabelColor;
  layout: "cluster" | "column" | "fill" | "grid" | "row";
  links?: CanvasSettingsLink[];
  type: "group";
  variant: "box" | "plain";
};

export type CanvasDetailsNode = {
  children: CanvasSettingsNode[];
  id: string;
  label: string;
  labelColor?: LabelColor;
  layout?: "cluster" | "column" | "fill" | "grid" | "row";
  open?: boolean;
  type: "details";
};

export type CanvasSettingsNode =
  | CanvasControl
  | CanvasDetailsNode
  | CanvasGroupNode;

export type CanvasSettingsTree = Array<CanvasDetailsNode | CanvasGroupNode>;

export type CanvasExperimentScene = {
  ariaLabel?: string;
  id: string;
  imageSrc?: string;
  label: string;
  script: string;
  settings?: CanvasSettingsTree;
};

export type CanvasDebugInfo = {
  fps?: number;
  metrics?: Array<{
    id: string;
    label: string;
    labelColor?: LabelColor;
    value: number | string;
  }>;
};

export type CanvasSettingsChangeHandler = (
  settings: CanvasSettings,
  changedKey: string
) => void;

export type CanvasExperimentCleanup = () => void;

export type CanvasExperimentContext = {
  canvas: HTMLCanvasElement;
  getSetting: (key: string) => CanvasSettingValue | undefined;
  imageSrc?: string;
  onSettingsChange: (
    handler: CanvasSettingsChangeHandler
  ) => CanvasExperimentCleanup;
  root: HTMLElement;
  setDebugInfo: (info?: CanvasDebugInfo) => void;
  setReady: (ready?: boolean) => void;
  settings: CanvasSettings;
};

export type CanvasExperimentMount = (
  context: CanvasExperimentContext
) => CanvasExperimentCleanup | Promise<CanvasExperimentCleanup | void> | void;
