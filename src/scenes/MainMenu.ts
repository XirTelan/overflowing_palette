import { Scene } from "phaser";
import { GameConfig, LevelData } from "../types";
import { MenuBtn } from "../classes/ui/MenuBtn";
import { LevelSelection } from "../classes/MainMenu/LevelSelection";
import { MenuTab } from "../classes/MainMenu/MenuTab";
import { LevelEditor } from "../classes/MainMenu/LevelEditor";

const TABS_KEYS = ["LevelEditor", "LevelSelector", "Options"];

export class MainMenu extends Scene {
  activeTab: string;
  tabs = new Map<string, MenuTab>();

  constructor() {
    super("MainMenu");
  }
  preload() {}
  create() {
    this.createBackground();
    this.makeMenuBtns();

    const levelSeletor = new LevelSelection({
      x: 500,
      y: 100,
      scene: this,
      width: 1400,
      height: 800,
      key: "LevelSelector",
    });

    const levelEditor = new LevelEditor({
      x: 500,
      y: 100,
      scene: this,
      width: 1400,
      height: 800,
      key: "LevelEditor",
    });

    this.tabs.set("LevelSelector", levelSeletor);
    this.tabs.set("LevelEditor", levelEditor);
  }
  private createBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.shader("distortion", width / 2, height / 2, width, height, [
      "background",
    ]);

    const isExist = this.textures.exists("gradient");
    if (!isExist) {
      const gradient = this.textures.createCanvas("gradient", 800, height);
      if (gradient) {
        const ctx = gradient.getContext();

        const grd = ctx.createLinearGradient(0, 0, 800, 0);
        grd.addColorStop(0.3, "black");
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

    const container = this.add.container(config.x, config.y);

    const defaultOffset = 100 + config.gap;

    const levelSelector = this.createButton(
      0,
      0,
      "Select Level",
      "LevelSelector"
    );
    const levelEditor = this.createButton(
      0,
      defaultOffset,
      "Create Level",
      "LevelEditor"
    );
    const options = this.createButton(
      0,
      defaultOffset * 2,
      "Options",
      "Options"
    );

    container.add(levelSelector);
    container.add(levelEditor);
    container.add(options);
  }
  private createButton(x: number, y: number, text: string, tabKey: string) {
    return new MenuBtn(this, x, y, text, () => {
      TABS_KEYS.forEach((key) => {
        const tab = this.tabs.get(key);
        if (!tab) return;
        if (tabKey == key && !tab.container.visible) tab.show();
        else tab.hide();
      });
    }).container;
  }
}
