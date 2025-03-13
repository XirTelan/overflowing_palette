import { Scene } from "phaser";
import { OptionTab } from "./OptionTab";
import { Select } from "../../ui/html/Select";
import { OptionFolder } from "../../ui/html/OptionFolder";
import { ValueSelector } from "../../ui/html/ValueSelector";
import { getLocal } from "../../../utils";
import {
  BackgroundConfig,
  GameConfig,
  LanguageConfig,
  LocalizationConfig,
} from "../../../types";

type GeneralTabConfig = {
  background: BackgroundConfig;
  lang: string;
};

export class GeneralTab extends OptionTab {
  scene: Scene;

  currentConfig: GeneralTabConfig = {
    background: {
      current: {
        distortion: 0,
        overlay: 0,
        key: "",
      },
      options: [],
    },
    lang: "",
  };

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

    this.scene = scene;
    const config = scene.cache.json.get("config") as GameConfig;

    this.currentConfig.background = config.background;
    this.currentConfig.lang = localStorage.getItem("lang") ?? "en";

    this.createTextSection();
    this.createBackgroundSection();
  }

  private createTextSection() {
    const { meta } = this.scene.cache.json.get(
      "localization"
    ) as LocalizationConfig;

    const { generalTab } = getLocal(this.scene)[
      "options"
    ] as LanguageConfig["options"];

    const select = new Select(
      generalTab.languageSelection,
      this.currentConfig.lang,
      meta.langsAvailable.map((obj) => obj.name),
      (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentConfig.background.current.key = target?.value;
      },
      meta.langsAvailable.map((obj) => obj.key)
    );

    const languageBlock = new OptionFolder(generalTab.languageBlock);
    languageBlock.add(select.container);
    this.tab.appendChild(languageBlock.container);
  }
  private createBackgroundSection() {
    const { generalTab } = getLocal(this.scene)["options"];

    const bgImage = new Select(
      generalTab.image,
      this.currentConfig.background.current.key,
      this.currentConfig.background.options.map((obj) => obj.name),
      (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentConfig.background.current.key = target?.value;
        console.log(this.currentConfig);
      },
      this.currentConfig.background.options.map((obj) => obj.key)
    );

    const distortion = new ValueSelector(
      generalTab.distortion,
      this.currentConfig.background.current.distortion,
      ["Off", "On"],
      false,
      (val) => {
        this.currentConfig.background.current.distortion = val;
      }
    );
    const overlay = new ValueSelector(
      generalTab.overlay,
      this.currentConfig.background.current.overlay,
      ["Off", "On"],
      false,
      (val) => {
        this.currentConfig.background.current.overlay = val;
      }
    );

    const backgroundBlock = new OptionFolder(generalTab.background);

    backgroundBlock.add(bgImage.container);
    backgroundBlock.add(distortion.container);
    backgroundBlock.add(overlay.container);

    this.tab.appendChild(backgroundBlock.container);
  }

  getValues() {
    return this.currentConfig;
  }
}
