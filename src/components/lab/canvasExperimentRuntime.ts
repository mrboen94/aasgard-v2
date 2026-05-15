import type {
  CanvasDebugInfo,
  CanvasExperimentCleanup,
  CanvasExperimentContext,
  CanvasSettingValue,
  CanvasSettings,
  CanvasSettingsChangeHandler,
  CanvasSettingsLink,
  LabelColor
} from "./canvasExperiment";
import {
  applyLabelColor,
  formatDisplayValue,
  parseJson,
  readControlValue,
  valuesMatch,
  type CanvasExperimentModule,
  type LinkGroup,
  type PresetOption,
  type RuntimeScene
} from "./canvasExperimentDom";

const sketchModules = import.meta.glob<CanvasExperimentModule>(
  "/src/content/experiments/**/sketches/*.ts"
);

export function mountCanvasExperiments() {
  const cleanups: CanvasExperimentCleanup[] = [];

  document
    .querySelectorAll<HTMLElement>("[data-canvas-experiment]")
    .forEach((root) => {
      if (root.dataset.mounted === "true") return;

      const canvas = root.querySelector<HTMLCanvasElement>("canvas");
      const scenes = parseJson<RuntimeScene[]>(root.dataset.scenes, []);
      const fallback = root.querySelector<HTMLImageElement>(
        ".canvas-experiment__fallback"
      );
      const debugPanel = root.querySelector<HTMLElement>("[data-canvas-debug]");
      const panels = Array.from(
        root.querySelectorAll<HTMLElement>("[data-canvas-controls-panel]")
      );
      const tabs = Array.from(
        root.querySelectorAll<HTMLButtonElement>("[data-canvas-scene-tab]")
      );

      if (!canvas || scenes.length === 0) return;

      root.dataset.mounted = "true";
      const experimentCanvas = canvas;

      const settingsByScene = parseJson<Record<string, CanvasSettings>>(
        root.dataset.settings,
        {}
      );
      const linkGroupsByScene = new Map<string, LinkGroup[]>();
      let activeSceneId = root.dataset.activeSceneId || scenes[0]?.id;
      let mountVersion = 0;
      const settingsSubscribers = new Set<CanvasSettingsChangeHandler>();
      let sketchCleanup: CanvasExperimentCleanup | void;
      const linkCleanups: CanvasExperimentCleanup[] = [];
      const tabCleanups: CanvasExperimentCleanup[] = [];

      function getScene(sceneId = activeSceneId) {
        return scenes.find((scene) => scene.id === sceneId);
      }

      function getPanel(sceneId = activeSceneId) {
        return panels.find((panel) => panel.dataset.canvasSceneId === sceneId);
      }

      function getSettings(sceneId = activeSceneId) {
        settingsByScene[sceneId] = settingsByScene[sceneId] ?? {};
        return settingsByScene[sceneId];
      }

      function getControls(sceneId: string, key: string) {
        const panel = getPanel(sceneId);

        if (!panel) return [];

        return Array.from(
          panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
            "[data-canvas-control]"
          )
        ).filter((control) => control.dataset.canvasControl === key);
      }

      function getControlBounds(sceneId: string, key: string) {
        const control = getControls(sceneId, key).find(
          (item): item is HTMLInputElement =>
            item instanceof HTMLInputElement &&
            (item.type === "number" || item.type === "range")
        );

        if (!control) return {};

        return {
          max: control.max === "" ? undefined : Number.parseFloat(control.max),
          min: control.min === "" ? undefined : Number.parseFloat(control.min)
        };
      }

      function clampSetting(sceneId: string, key: string, value: number) {
        const { max, min } = getControlBounds(sceneId, key);
        let nextValue = value;

        if (typeof min === "number" && Number.isFinite(min)) {
          nextValue = Math.max(min, nextValue);
        }

        if (typeof max === "number" && Number.isFinite(max)) {
          nextValue = Math.min(max, nextValue);
        }

        return nextValue;
      }

      function updateRangeValue(
        sceneId: string,
        key: string,
        value: CanvasSettingValue
      ) {
        const panel = getPanel(sceneId);

        if (!panel) return;

        panel
          .querySelectorAll<HTMLOutputElement>("[data-canvas-value-for]")
          .forEach((output) => {
            if (output.dataset.canvasValueFor !== key) return;

            output.textContent = formatDisplayValue(
              value,
              output.dataset.canvasValueUnit
            );
          });
      }

      function updateControls(
        sceneId: string,
        key: string,
        value: CanvasSettingValue
      ) {
        getControls(sceneId, key).forEach((control) => {
          if (control instanceof HTMLInputElement && control.type === "checkbox") {
            control.checked = Boolean(value);
            return;
          }

          if (control instanceof HTMLInputElement && control.type === "radio") {
            control.checked = control.value === String(value);
            return;
          }

          control.value = String(value);
        });

        updateRangeValue(sceneId, key, value);
      }

      function writeSetting(
        sceneId: string,
        key: string,
        value: CanvasSettingValue,
        updateVisibleControls: boolean
      ) {
        const sceneSettings = getSettings(sceneId);

        if (valuesMatch(sceneSettings[key], value)) {
          if (updateVisibleControls) {
            updateControls(sceneId, key, value);
          } else {
            updateRangeValue(sceneId, key, value);
          }

          return false;
        }

        sceneSettings[key] = value;

        if (updateVisibleControls) {
          updateControls(sceneId, key, value);
        } else {
          updateRangeValue(sceneId, key, value);
        }

        return true;
      }

      function notifySettingsChanged(sceneId: string, changedKeys: Set<string>) {
        if (sceneId !== activeSceneId) return;

        const sceneSettings = getSettings(sceneId);

        changedKeys.forEach((changedKey) => {
          settingsSubscribers.forEach((handler) =>
            handler(sceneSettings, changedKey)
          );
        });
      }

      function applyLinkedSettings(sceneId: string, changedKeys: Set<string>) {
        const linkGroups = linkGroupsByScene.get(sceneId) ?? [];
        const sourceKeys = Array.from(changedKeys);

        sourceKeys.forEach((changedKey) => {
          const sourceValue = getSettings(sceneId)[changedKey];

          if (typeof sourceValue !== "number") return;

          linkGroups.forEach((group) => {
            if (!group.enabled) return;

            group.links
              .filter((link) => link.source === changedKey)
              .forEach((link) => {
                link.targets.forEach((target) => {
                  const ratio = target.ratio ?? 1;
                  const offset = target.offset ?? 0;
                  const nextValue = clampSetting(
                    sceneId,
                    target.id,
                    sourceValue * ratio + offset
                  );

                  if (writeSetting(sceneId, target.id, nextValue, true)) {
                    changedKeys.add(target.id);
                  }
                });
              });
          });
        });
      }

      function commitSettingChange(
        sceneId: string,
        key: string,
        value: CanvasSettingValue,
        updateVisibleControls: boolean
      ) {
        const changedKeys = new Set<string>();

        if (writeSetting(sceneId, key, value, updateVisibleControls)) {
          changedKeys.add(key);
        }

        if (changedKeys.size > 0) {
          applyLinkedSettings(sceneId, changedKeys);
          notifySettingsChanged(sceneId, changedKeys);
        }
      }

      function applyPreset(sceneId: string, preset: PresetOption) {
        const changedKeys = new Set<string>();

        Object.entries(preset.settings).forEach(([key, value]) => {
          if (typeof value === "undefined") return;

          if (writeSetting(sceneId, key, value, true)) {
            changedKeys.add(key);
          }
        });

        if (changedKeys.size > 0) {
          applyLinkedSettings(sceneId, changedKeys);
          notifySettingsChanged(sceneId, changedKeys);
        }
      }

      function clearDebugInfo() {
        if (!debugPanel) return;

        debugPanel.replaceChildren();
        debugPanel.hidden = true;
      }

      function addDebugMetric(
        label: string,
        value: number | string,
        labelColor?: LabelColor
      ) {
        if (!debugPanel) return;

        const metric = document.createElement("div");
        const labelElement = document.createElement("span");
        const valueElement = document.createElement("strong");

        metric.className =
          "flex items-baseline gap-2 rounded-small border border-border bg-[color-mix(in_srgb,var(--color-surface)_56%,transparent)] px-2 py-1";
        applyLabelColor(labelElement, labelColor);
        labelElement.className = `font-accent text-meta ${labelElement.className}`;
        valueElement.className = "font-code text-meta font-normal text-foreground";
        labelElement.textContent = label;
        valueElement.textContent = String(value);
        metric.append(labelElement, valueElement);
        debugPanel.append(metric);
      }

      function setDebugInfo(info?: CanvasDebugInfo) {
        if (!debugPanel) return;

        debugPanel.replaceChildren();

        const hasFps = typeof info?.fps !== "undefined";
        const metrics = info?.metrics ?? [];

        if (!info || (!hasFps && metrics.length === 0)) {
          debugPanel.hidden = true;
          return;
        }

        debugPanel.hidden = false;

        if (hasFps) {
          addDebugMetric("FPS", info.fps ?? "");
        }

        metrics.forEach((metric) => {
          addDebugMetric(metric.label, metric.value, metric.labelColor);
        });
      }

      function clearReadyState() {
        delete root.dataset.ready;
      }

      function cleanupSketch() {
        mountVersion += 1;
        sketchCleanup?.();
        sketchCleanup = undefined;
        settingsSubscribers.clear();
        clearDebugInfo();
        clearReadyState();
      }

      function updateSceneUi() {
        const scene = getScene();

        if (!scene) return;

        root.dataset.activeSceneId = scene.id;

        if (scene.imageSrc) {
          root.dataset.imageSrc = scene.imageSrc;
        } else {
          delete root.dataset.imageSrc;
        }

        root.classList.toggle(
          "canvas-experiment--with-image",
          Boolean(scene.imageSrc)
        );
        experimentCanvas.setAttribute(
          "aria-label",
          scene.ariaLabel ||
            root.dataset.defaultAriaLabel ||
            "Interactive canvas experiment"
        );

        if (fallback) {
          fallback.hidden = !scene.imageSrc;

          if (scene.imageSrc) {
            fallback.src = scene.imageSrc;
          } else {
            fallback.removeAttribute("src");
          }
        }

        panels.forEach((panel) => {
          panel.hidden = panel.dataset.canvasSceneId !== scene.id;
        });

        tabs.forEach((tab) => {
          const selected = tab.dataset.canvasSceneTab === scene.id;
          tab.setAttribute("aria-selected", selected ? "true" : "false");
          tab.tabIndex = selected ? 0 : -1;
        });
      }

      function mountActiveSketch() {
        const scene = getScene();

        if (!scene) return;

        const loadSketch = sketchModules[scene.script];

        if (!loadSketch) {
          console.error(`Canvas experiment script was not found: ${scene.script}`);
          return;
        }

        const token = mountVersion;
        const sceneSettings = getSettings(scene.id);
        const context: CanvasExperimentContext = {
          canvas: experimentCanvas,
          getSetting: (key) => sceneSettings[key],
          imageSrc: scene.imageSrc,
          onSettingsChange: (handler) => {
            settingsSubscribers.add(handler);
            return () => settingsSubscribers.delete(handler);
          },
          root,
          setDebugInfo,
          setReady: (ready = true) => {
            if (ready) {
              root.dataset.ready = "true";
            } else {
              clearReadyState();
            }
          },
          settings: sceneSettings
        };

        loadSketch()
          .then(async (module) => {
            if (token !== mountVersion) return;

            const mount = module.mount ?? module.default;

            if (!mount) {
              console.error(
                `Canvas experiment script has no mount export: ${scene.script}`
              );
              return;
            }

            const nextCleanup = await mount(context);

            if (token !== mountVersion) {
              nextCleanup?.();
              return;
            }

            sketchCleanup = nextCleanup;
          })
          .catch((error: unknown) => {
            console.error(
              `Canvas experiment failed to load: ${scene.script}`,
              error
            );
          });
      }

      function syncLinkToggle(group: LinkGroup) {
        if (!group.button) return;

        group.button.setAttribute(
          "aria-pressed",
          group.enabled ? "true" : "false"
        );
      }

      panels.forEach((panel) => {
        const sceneId = panel.dataset.canvasSceneId;

        if (!sceneId) return;

        const linkGroups = Array.from(
          panel.querySelectorAll<HTMLElement>(
            "[data-canvas-group][data-canvas-links]"
          )
        ).map((group) => {
          const groupId = group.dataset.canvasGroup;
          const button = groupId
            ? panel.querySelector<HTMLButtonElement>(
                `[data-canvas-link-toggle="${groupId}"]`
              )
            : null;
          const linkGroup: LinkGroup = {
            button: button ?? undefined,
            enabled: group.dataset.canvasLinksEnabled !== "false",
            links: parseJson<CanvasSettingsLink[]>(group.dataset.canvasLinks, [])
          };

          syncLinkToggle(linkGroup);
          const toggleLinkGroup = () => {
            linkGroup.enabled = !linkGroup.enabled;
            syncLinkToggle(linkGroup);

            if (!linkGroup.enabled) return;

            const changedKeys = new Set<string>(
              linkGroup.links.map((link) => link.source)
            );
            applyLinkedSettings(sceneId, changedKeys);
            notifySettingsChanged(sceneId, changedKeys);
          };

          button?.addEventListener("click", toggleLinkGroup);

          if (button) {
            linkCleanups.push(() =>
              button.removeEventListener("click", toggleLinkGroup)
            );
          }

          return linkGroup;
        });

        linkGroupsByScene.set(sceneId, linkGroups);
      });

      const controlCleanups = Array.from(
        root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          "[data-canvas-control]"
        )
      ).map((control) => {
        const handler = () => {
          if (
            control instanceof HTMLInputElement &&
            control.type === "radio" &&
            !control.checked
          ) {
            return;
          }

          const key = control.dataset.canvasControl;
          const sceneId =
            control.closest<HTMLElement>("[data-canvas-controls-panel]")
              ?.dataset.canvasSceneId ?? activeSceneId;

          if (!key) return;

          commitSettingChange(sceneId, key, readControlValue(control), false);
        };
        const events =
          control instanceof HTMLInputElement &&
          (control.type === "number" || control.type === "range")
            ? ["input", "change"]
            : ["change"];

        events.forEach((eventName) =>
          control.addEventListener(eventName, handler)
        );

        return () => {
          events.forEach((eventName) =>
            control.removeEventListener(eventName, handler)
          );
        };
      });

      const presetCleanups = Array.from(
        root.querySelectorAll<HTMLSelectElement>("[data-canvas-preset]")
      ).map((presetControl) => {
        const handler = () => {
          const sceneId =
            presetControl.closest<HTMLElement>("[data-canvas-controls-panel]")
              ?.dataset.canvasSceneId ?? activeSceneId;
          const options = parseJson<PresetOption[]>(
            presetControl.dataset.canvasPresetOptions,
            []
          );
          const preset = options.find(
            (option) => option.value === presetControl.value
          );

          if (!preset) return;

          applyPreset(sceneId, preset);
          presetControl.value = "";
        };

        presetControl.addEventListener("change", handler);

        return () => presetControl.removeEventListener("change", handler);
      });

      tabs.forEach((tab) => {
        const switchScene = () => {
          const nextSceneId = tab.dataset.canvasSceneTab;

          if (!nextSceneId || nextSceneId === activeSceneId) return;

          cleanupSketch();
          activeSceneId = nextSceneId;
          updateSceneUi();
          mountActiveSketch();
        };

        tab.addEventListener("click", switchScene);
        tabCleanups.push(() => tab.removeEventListener("click", switchScene));
      });

      updateSceneUi();
      mountActiveSketch();

      cleanups.push(() => {
        cleanupSketch();
        controlCleanups.forEach((cleanup) => cleanup());
        presetCleanups.forEach((cleanup) => cleanup());
        linkCleanups.forEach((cleanup) => cleanup());
        tabCleanups.forEach((cleanup) => cleanup());
        root.dataset.mounted = "false";
      });
    });

  document.addEventListener(
    "astro:before-swap",
    () => {
      cleanups.forEach((cleanup) => cleanup());
    },
    { once: true }
  );
}
