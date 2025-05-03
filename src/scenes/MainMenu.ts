import { DebugMenu } from "@/classes/common/DebugMenu";
import { EndlessZen } from "@/classes/MainMenu/EndlessZen";
import { LevelEditor } from "@/classes/MainMenu/LevelEditor";
import { LevelSelection } from "@/classes/MainMenu/LevelSelection/LevelSelection";
import { MenuTab } from "@/classes/MainMenu/MenuTab";
import { Options } from "@/classes/MainMenu/Options/Options";
import { Background } from "@/classes/ui/Background";
import { MenuBtn } from "@/classes/ui/buttons/MenuBtn";
import { GameConfig, LanguageConfig } from "@/types";
import { getLocal } from "@/utils";
import { Scene } from "phaser";

type TabConfig = {
  key: string;
  type: new (...args: any[]) => MenuTab;
  props?: Partial<MenuTab>;
};

const TABS: TabConfig[] = [
  {
    key: "LevelSelector",
    props: {
      width: 1000,
    },
    type: LevelSelection,
  },
  {
    key: "LevelEditor",
    type: LevelEditor,
  },
  {
    key: "EndlessZen",
    type: EndlessZen,
  },
  {
    key: "Options",
    type: Options,
  },
];

const OFFSET_X = 500;

export class MainMenu extends Scene {
  activeTab: string;
  tabs = new Map<string, MenuTab>();
  tabBtns = new Map<string, MenuBtn>();

  constructor() {
    super("MainMenu");
  }
  create() {
    const width = this.cameras.main.width - OFFSET_X;
    const height = this.cameras.main.height;

    this.createBackground();
    this.makeMenuBtns();

    const isProduction = import.meta.env.PROD;
    if (!isProduction) {
      new DebugMenu(600, 200, this).init();
    }

    TABS.forEach((tab) => {
      const newTab = new tab.type({
        x: OFFSET_X,
        y: 0,
        scene: this,
        width: width,
        height: height,
        key: tab.key,
        ...tab.props,
      });

      this.tabs.set(tab.key, newTab);
    });

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

    this.add
      .graphics()
      .fillStyle(0x161616, 1)
      .lineStyle(4, 0x444444, 0.6)
      .lineBetween(50, 0, 50, this.cameras.main.height);
  }

  private makeMenuBtns() {
    const { x, y, gap } = this.cache.json.get("config").mainMenu
      .buttonsBlock as GameConfig["mainMenu"]["buttonsBlock"];

    const local: LanguageConfig = getLocal(this);

    const container = this.add.container(x, y);

    const defaultOffset = 100 + gap;

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

    const git = this.createButton(
      0,
      this.cameras.main.height - 300,
      local.mainMenu.gitHub,
      "Git"
    );

    git.btn.on("pointerup", () => {
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
      TABS.forEach(({ key }) => {
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
