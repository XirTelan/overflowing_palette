import { AudioManager } from "@/classes/common/AudioManager";
import { DebugMenu } from "@/classes/common/DebugMenu";
import { EndlessZen } from "@/classes/MainMenu/EndlessZen";
import { LevelEditor } from "@/classes/MainMenu/LevelEditor";
import { LevelSelection } from "@/classes/MainMenu/LevelSelection/LevelSelection";
import { MenuTab } from "@/classes/MainMenu/MenuTab";
import { Options } from "@/classes/MainMenu/Options/Options";
import { TutorialsTab } from "@/classes/MainMenu/Tutorials/TutorialsTab";
import { Background } from "@/classes/ui/Background";
import { MenuBtn } from "@/classes/ui/buttons/MenuBtn";
import { LanguageConfig } from "@/types";
import { getConfig, getLocal } from "@/utils";
import { Scene } from "phaser";

type TabConfig = {
  key: string;
  type: new (...args: any[]) => MenuTab;
  props?: Partial<MenuTab>;
};

const TABS: TabConfig[] = [
  { key: "LevelSelector", type: LevelSelection },
  { key: "LevelEditor", type: LevelEditor },
  { key: "EndlessZen", type: EndlessZen },
  { key: "Tutorials", type: TutorialsTab },
  { key: "Options", type: Options },
];

const OFFSET_X = 500;

export class MainMenu extends Scene {
  activeTab: string;
  tabs = new Map<string, MenuTab>();
  tabBtns = new Map<string, MenuBtn>();
  btnsContainer!: Phaser.GameObjects.Container;

  tutorialMenu?: TutorialsTab;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.initAudioManager();
    this.createBackground();
    this.createTabs();
    this.createButtons();

    if (!import.meta.env.PROD) {
      new DebugMenu(600, 200, this).init();
    }

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  private initAudioManager() {
    const existing = this.registry.get("audioManager") as AudioManager;
    const audioManager = existing?.setScene?.(this) ?? new AudioManager(this);
    this.registry.set("audioManager", audioManager);
  }

  private createBackground() {
    const { width, height } = this.cameras.main;
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
      .lineBetween(50, 0, 50, height);
  }

  private createTabs() {
    const { width, height } = this.cameras.main;
    const tabArea = { x: OFFSET_X, y: 0, width: width - OFFSET_X, height };

    for (const { key, type, props } of TABS) {
      const tab = new type({ scene: this, key, ...tabArea, ...props });
      this.tabs.set(key, tab);
    }
  }

  private createButtons() {
    getConfig(this).mainMenu.buttonsBlock;
    const { x, y, gap } = getConfig(this).mainMenu.buttonsBlock;
    const local: LanguageConfig = getLocal(this);

    const buttonData = [
      { key: "LevelSelector", text: local.mainMenu.selectLevel },
      { key: "EndlessZen", text: local.mainMenu.endlessZen },
      { key: "LevelEditor", text: local.mainMenu.createLevel },
      { key: "Tutorials", text: local.mainMenu.tutorials },
      { key: "Options", text: local.mainMenu.options },
    ];

    const container = this.add.container(x, y);
    const spacing = 100 + gap;

    buttonData.forEach(({ key, text }, i) => {
      const btn = this.createTabButton(0, i * spacing, text, key);
      this.tabBtns.set(key, btn);
      container.add(btn.container);
    });

    this.btnsContainer = container;
    this.events.on("shutdown", this.onDestroy, this);
  }

  onDestroy() {
    Object.values(this.tabs).forEach((tab: MenuTab) => tab.destroy());
    this.btnsContainer.destroy(true);
  }
  private createTabButton(x: number, y: number, label: string, tabKey: string) {
    return new MenuBtn(this, x, y, label, () => {
      TABS.forEach(({ key }) => {
        const tab = this.tabs.get(key);
        if (!tab) return;

        const isActive = tabKey === key && !tab.container.visible;
        this.tabBtns.get(key)?.update(isActive);
        tab.setActive(isActive);
      });
    });
  }
}
