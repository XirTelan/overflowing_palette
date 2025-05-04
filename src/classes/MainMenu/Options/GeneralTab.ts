import { Scene } from "phaser";
import { OptionTab } from "./OptionTab";
import { Select } from "../../ui/html/Select";
import { OptionFolder } from "../../ui/html/OptionFolder";
import { getLangCode, getLocal } from "../../../utils";
import {
  BackgroundConfig,
  GameConfig,
  LanguageConfig,
  LocalizationConfig,
} from "../../../types";
import { OptionSelector } from "../../ui/html/OptionSelector";

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
    this.currentConfig.lang = getLangCode();

    this.createTextSection();
    this.createBackgroundSection();
  }

  private createTextSection() {
    const langs = Object.entries(
      this.scene.cache.json.get("langs") as LocalizationConfig
    );
    const { generalTab } = getLocal(this.scene)[
      "options"
    ] as LanguageConfig["options"];

    const select = new Select(
      generalTab.languageSelection,
      this.currentConfig.lang,
      langs.map(([_, data]) => data.name),
      (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentConfig.lang = target?.value;
      },
      langs.map(([_, data]) => data.key)
    );

    const languageBlock = new OptionFolder(generalTab.languageBlock, "lang");
    languageBlock.add(select.container);
    this.tab.appendChild(languageBlock.container);
  }
  private createBackgroundSection() {
    const {
      options: { generalTab, defaultToggle },
      backgounds,
    } = getLocal(this.scene);

    const bgImage = new Select(
      generalTab.image,
      this.currentConfig.background.current.key,
      this.currentConfig.background.options.map((key) => backgounds[key]),
      (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentConfig.background.current.key = target?.value;
      },
      this.currentConfig.background.options
    );

    const distortion = new OptionSelector(
      generalTab.distortion,
      this.currentConfig.background.current.distortion,
      defaultToggle,
      false,
      (val) => {
        this.currentConfig.background.current.distortion = val;
      }
    );
    const overlay = new OptionSelector(
      generalTab.overlay,
      this.currentConfig.background.current.overlay,
      defaultToggle,
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
