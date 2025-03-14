import { Scene } from "phaser";
import { OptionFolder } from "../../ui/html/OptionFolder";
import { OptionTab } from "./OptionTab";
import { getLocal } from "../../../utils";
import { GameConfig } from "../../../types";
import { OptionSelector } from "../../ui/html/OptionSelector";

export class GameplayTab extends OptionTab {
  currentConfig;

  constructor(
    scene: Scene,
    key: string,
    isActive: boolean,
    btnText: string,
    width: number,
    btnContainer: HTMLDivElement,
    tabsContainer: HTMLDivElement,
    callback: (key: string) => void,
    context: object
  ) {
    super(
      key,
      isActive,
      btnText,
      btnContainer,
      tabsContainer,
      callback,
      context
    );

    const config = scene.cache.json.get("config") as GameConfig;

    this.currentConfig = config.gameplay;

    const { gameplayTab } = getLocal(scene)["options"];

    const folder = new OptionFolder("Grid options");

    const fluidColors = new OptionSelector(
      gameplayTab.fluidColors.text,
      this.currentConfig.fluidColors,
      gameplayTab.fluidColors.options,
      false,
      (val) => {
        this.currentConfig.fluidColors = val;
      }
    );
    const highlightIntensity = new OptionSelector(
      gameplayTab.highlightIntensity.text,
      this.currentConfig.highlightIntensity,
      gameplayTab.highlightIntensity.options,
      false,
      (val) => {
        this.currentConfig.highlightIntensity = val;
      }
    );

    folder.add(fluidColors.container);
    folder.add(highlightIntensity.container);

    this.tab.appendChild(folder.container);
  }

  getValues() {
    return this.currentConfig;
  }
}
