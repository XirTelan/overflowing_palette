import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { MenuTabProps, GameConfig } from "@/types";
import { getLocal } from "@/utils";
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
];

export class Options extends MenuTab {
  inputs: HTMLInputElement[] = [];

  generalTab!: GeneralTab;
  colorTab!: ColorsTab;
  soundTab!: SoundTab;
  gameplayTab!: GameplayTab;

  tabs: OptionTab[] = [];
  activeTab = "general";

  constructor(props: MenuTabProps) {
    super(props);

    const { options } = getLocal(this.scene);
    this.setupActionButtons(options);
    this.setupTabs(options);
  }

  private setupActionButtons(options: any) {
    this.actionBtn.text.setText(options.btnSave);
    this.actionBtn.btn.on("pointerup", this.saveUserConfig, this);

    const reset = new PrimaryBtn(
      980,
      880,
      options.btnReset,
      350,
      50,
      this.scene,
      this.resetUserConfig,
      this
    );

    this.container.add(reset.container);
  }

  private setupTabs(options: any) {
    const tabBtns = document.createElement("div");
    const tabsContainer = document.createElement("div");
    this.contentContainer.append(tabBtns, tabsContainer);
    this.contentContainer.classList.add("menu-options");

    const tabRefs: Record<string, OptionTab> = {};

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
      this.tabs.push(tab);
      tabRefs[key] = tab;
    });

    this.generalTab = tabRefs.general as GeneralTab;
    this.colorTab = tabRefs.colors as ColorsTab;
    this.soundTab = tabRefs.sound as SoundTab;
    this.gameplayTab = tabRefs.gameplay as GameplayTab;
  }

  updateActiveTab = (key: string) => {
    this.activeTab = key;
    this.tabs.forEach((tab) =>
      tab.key === key ? tab.activate() : tab.disable()
    );
  };

  show(): void {
    super.show();
    this.update();
  }

  update() {
    const { colors } = this.scene.cache.json.get("config");

    this.inputs.forEach((input, indx) => {
      const fromCache = colors[indx];
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
    const levelsCleared = localStorage.getItem("levels.cleared");
    localStorage.clear();

    if (levelsCleared) {
      localStorage.setItem("levels.cleared", levelsCleared);
    }

    this.hide();
    this.scene.cache.json.remove("config");
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start("Boot");
    });
  };

  private saveUserConfig = () => {
    const colorsData = this.colorTab.getValues();
    const generalData = this.generalTab.getValues();
    const gameplayData = this.gameplayTab.getValues();

    const savedConfig = this.scene.cache.json.get("config") as GameConfig;

    if (this.colorTab.isDirty && !deepEqual(savedConfig.colors, colorsData)) {
      localStorage.setItem("colors", JSON.stringify(colorsData));
    }

    localStorage.setItem("background", JSON.stringify(generalData.background));
    localStorage.setItem("gameplay", JSON.stringify(gameplayData));
    localStorage.setItem("lang", generalData.lang);

    this.hide();
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start("Boot");
    });
  };
}

function deepEqual(x: any, y: any): boolean {
  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  if (x === y) return true;
  if (typeof x !== "object" || typeof y !== "object") return false;
  if (keysX.length !== keysY.length) return false;

  return keysX.every((key) => deepEqual(x[key], y[key]));
}
