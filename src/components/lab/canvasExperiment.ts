export type CanvasSettingValue = boolean | number | string;

type BaseCanvasControl = {
  id: string;
  label: string;
};

export type CanvasRangeControl = BaseCanvasControl & {
  max: number;
  min: number;
  step?: number;
  type: "range";
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

export type CanvasControl =
  | CanvasCheckboxControl
  | CanvasNumberControl
  | CanvasRadioControl
  | CanvasRangeControl
  | CanvasSelectControl;

export type CanvasSettings = Record<string, CanvasSettingValue>;

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
  setReady: (ready?: boolean) => void;
  settings: CanvasSettings;
};

export type CanvasExperimentMount = (
  context: CanvasExperimentContext
) => CanvasExperimentCleanup | Promise<CanvasExperimentCleanup | void> | void;
