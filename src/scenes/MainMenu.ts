import { Scene } from "phaser";
import { GameConfig, LanguageConfig } from "../types";
import { MenuBtn } from "../classes/ui/MenuBtn";
import { LevelSelection } from "../classes/MainMenu/LevelSelection/LevelSelection";
import { MenuTab } from "../classes/MainMenu/MenuTab";
import { LevelEditor } from "../classes/MainMenu/LevelEditor";
import { Options } from "../classes/MainMenu/Options/Options";
import { getLocal } from "../utils";
import { Background } from "../classes/ui/Background";
import { EndlessZen } from "../classes/MainMenu/EndlessZen";

const TABS_KEYS = ["LevelEditor", "EndlessZen", "LevelSelector", "Options"];

const OFFSET_X = 500;

export class MainMenu extends Scene {
  activeTab: string;
  tabs = new Map<string, MenuTab>();
  tabBtns = new Map<string, MenuBtn>();

  constructor() {
    super("MainMenu");
  }
  preload() {}
  create() {
    this.createBackground();
    this.makeMenuBtns();

    const width = this.cameras.main.width - OFFSET_X;
    const height = this.cameras.main.height;

    const levelSeletor = new LevelSelection({
      x: OFFSET_X,
      y: 0,
      scene: this,
      width: 1000,
      height: height,
      key: "LevelSelector",
    });

    const endlessZen = new EndlessZen({
      x: OFFSET_X,
      y: 0,
      scene: this,
      width: 1000,
      height: height,
      key: "EndlessZen",
    });

    const levelEditor = new LevelEditor({
      x: OFFSET_X,
      y: 0,
      scene: this,
      width: width,
      height: height,
      key: "LevelEditor",
    });

    const options = new Options({
      x: 500,
      y: 0,
      scene: this,
      width: width,
      height: height,
      key: "Options",
    });

    this.tabs.set("LevelSelector", levelSeletor);
    this.tabs.set("EndlessZen", endlessZen);
    this.tabs.set("LevelEditor", levelEditor);
    this.tabs.set("Options", options);
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
  private createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    new Background(this);

    const isExist = this.textures.exists("gradient");
    if (!isExist) {
      const gradient = this.textures.createCanvas("gradient", 800, height);
      if (gradient) {
        const ctx = gradient.getContext();

        const grd = ctx.createLinearGradient(0, 0, 800, 0);
        grd.addColorStop(0.0, "black");
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        gradient.refresh();
      }
    }

    this.add.image(0, 0, "gradient").setOrigin(0);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x161616, 1);
    graphics.lineStyle(4, 0x444444, 0.6);

    graphics.lineBetween(50, 0, 50, this.cameras.main.height);
  }

  private makeMenuBtns() {
    const config: GameConfig["mainMenu"]["buttonsBlock"] =
      this.cache.json.get("config")["mainMenu"]["buttonsBlock"];

    const local: LanguageConfig = getLocal(this);

    const container = this.add.container(config.x, config.y);

    const defaultOffset = 100 + config.gap;

    const buttonData = [
      { key: "LevelSelector", text: local.mainMenu.selectLevel },
      {
        key: "EndlessZen",
        text: local.mainMenu.endlessZen,
      },
      {
        key: "LevelEditor",
        text: local.mainMenu.createLevel,
      },
      {
        key: "Options",
        text: local.mainMenu.options,
      },
    ];

    buttonData.forEach(({ key, text }, indx) => {
      const btn = this.createButton(0, indx * defaultOffset, text, key);
      this.tabBtns.set(key, btn);
      container.add(btn.container);
    });

    console.log("asdasdasd", this.tabBtns);

    const git = this.createButton(
      0,
      this.cameras.main.height - 300,
      local.mainMenu.gitHub,
      "Git"
    );

    git.btn.on("pointerdown", () => {
      window.open(
        "https://github.com/XirTelan/overflowing_palette",
        "GitHubProject"
      );
    });
    git.text.setFontSize(24);
    container.add(git.container);
  }
  private createButton(x: number, y: number, text: string, tabKey: string) {
    return new MenuBtn(this, x, y, text, tabKey, () => {
      TABS_KEYS.forEach((key) => {
        const tab = this.tabs.get(key);

        if (!tab) return;
        const isActive = tabKey == key && !tab.container.visible;
        this.tabBtns.get(key)?.update(isActive);
        if (isActive) tab.show();
        else tab.hide();
      });
    });
  }
}
