import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { MenuTabProps, LanguageConfig } from "@/types";
import { getConfig, getLocal, localStoragePrefix } from "@/utils";
import { MenuTab } from "../MenuTab";
import { ColorsTab } from "./ColorsTab";
import { GameplayTab } from "./GameplayTab";
import { GeneralTab } from "./GeneralTab";
import { OptionTab } from "./OptionTab";
import { SoundTab } from "./SoundTab";

const tabDefinitions = [
  { key: "general", TabClass: GeneralTab },
  { key: "colors", TabClass: ColorsTab },
  { key: "sound", TabClass: SoundTab },
  { key: "gameplay", TabClass: GameplayTab },
] as const;

type TabKey = (typeof tabDefinitions)[number]["key"];

export class Options extends MenuTab {
  inputs: HTMLInputElement[] = [];
  tabs: Record<TabKey, OptionTab> = {} as any;
  activeTab: TabKey = "general";

  constructor(props: MenuTabProps) {
    super(props);

    const { options } = getLocal(this.scene);
    this.setupActionButtons(options);
    this.setupTabs(options);
  }

  private setupActionButtons(options: LanguageConfig["options"]) {
    const { primaryBtn } = getConfig(this.scene).mainMenu.options;
    this.actionBtn.text.setText(options.btnSave);
    this.actionBtn.btn.on("pointerup", this.saveUserConfig, this);

    const reset = new PrimaryBtn(
      primaryBtn.x,
      primaryBtn.y,
      options.btnReset,
      primaryBtn.width,
      primaryBtn.height,
      this.scene,
      this.resetUserConfig,
      this
    );

    this.container.add(reset.container);
  }

  private setupTabs(options: LanguageConfig["options"]) {
    const tabBtns = document.createElement("div");
    const tabsContainer = document.createElement("div");
    this.contentContainer.append(tabBtns, tabsContainer);
    this.contentContainer.classList.add("menu-options");

    tabDefinitions.forEach(({ key, TabClass }) => {
      const isActive = key === this.activeTab;
      const label = options.tabs[key];
      const tab = new TabClass(
        this.scene,
        key,
        isActive,
        label,
        tabBtns,
        tabsContainer,
        this.updateActiveTab,
        this
      );

      this.tabs[key] = tab;
    });

    this.scene.events.on(
      "shutdown",
      () => {
        this.container.destroy(true);
        Object.values(this.tabs).forEach((tab) => tab.destroy());
      },
      this
    );
  }

  private isTabKey(key: string): key is TabKey {
    return tabDefinitions.some((obj) => obj.key == key);
  }

  updateActiveTab = (key: string) => {
    if (!this.isTabKey(key)) return;
    this.activeTab = key;
    Object.entries(this.tabs).forEach(([tabKey, tab]) => {
      tabKey === key ? tab.activate() : tab.disable();
    });
  };

  show(): void {
    super.show();
    this.update();
  }

  update() {
    const { colors } = this.scene.cache.json.get("config");

    this.inputs.forEach((input, index) => {
      const fromCache = colors[index];
      const color = Phaser.Display.Color.RGBToString(
        fromCache.x * 255,
        fromCache.y * 255,
        fromCache.z * 255
      );
      input.style.background = color;
      input.value = color;
    });
  }

  addText(text: string, container: HTMLDivElement, className?: string) {
    const block = document.createElement("p");
    block.textContent = text;
    if (className) block.classList.add(className);
    container.appendChild(block);
  }

  addCheckbox(text: string, container: HTMLDivElement, key: string) {
    const divContainer = document.createElement("div");
    divContainer.className = "checkbox-row";
    this.addText(text, divContainer);

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked = Boolean(localStorage.getItem(key));

    divContainer.appendChild(checkBox);
    container.appendChild(divContainer);

    return checkBox;
  }

  private resetUserConfig = () => {
    const levelsCleared = localStorage.getItem(
      `${localStoragePrefix}levels.cleared`
    );
    localStorage.clear();
    if (levelsCleared) {
      localStorage.setItem(
        `${localStoragePrefix}levels.cleared`,
        levelsCleared
      );
    }

    this.hide();
    this.scene.cache.json.remove("config");
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start("Boot");
    });
  };

  private saveUserConfig = () => {
    const colorTab = this.tabs["colors"] as ColorsTab;
    const generalTab = this.tabs["general"] as GeneralTab;
    const gameplayTab = this.tabs["gameplay"] as GameplayTab;

    const savedConfig = getConfig(this.scene);
    const colorsData = colorTab.getValues();
    const generalData = generalTab.getValues();
    const gameplayData = gameplayTab.getValues();

    if (colorTab.isDirty && !deepEqual(savedConfig.colors, colorsData)) {
      localStorage.setItem(
        `${localStoragePrefix}colors`,
        JSON.stringify(colorsData)
      );
    }

    localStorage.setItem(
      `${localStoragePrefix}background`,
      JSON.stringify(generalData.background)
    );
    localStorage.setItem(
      `${localStoragePrefix}gameplay`,
      JSON.stringify(gameplayData)
    );
    localStorage.setItem("lang", generalData.lang);

    this.hide();
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start("Boot");
    });
  };
}

function deepEqual(x: any, y: any): boolean {
  if (x === y) return true;
  if (typeof x !== "object" || typeof y !== "object" || !x || !y) return false;

  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  if (keysX.length !== keysY.length) return false;

  return keysX.every((key) => deepEqual(x[key], y[key]));
}
