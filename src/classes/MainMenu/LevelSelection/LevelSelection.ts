import { MenuTab } from "../MenuTab";
import { SelectedLevelInfo } from "./SelectedLevelInfo";
import { ImportLevel } from "./Import";
import { getLocal, getUserLevelsCleared } from "../../../utils";
import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { LevelData, LanguageConfig, LevelEntry, MenuTabProps } from "@/types";

const PREVIEW_POS = 1000;

export class LevelSelection extends MenuTab {
  selectedLevelData: LevelData;
  selectedFolder: string;
  selectedLevelInfo: SelectedLevelInfo;
  levelsContainer: Phaser.GameObjects.DOMElement;
  localCache: LanguageConfig;
  clearedLevels: Map<string, any>;
  importBlock: ImportLevel;
  levels: LevelEntry[];
  groupedLevels: Map<string, Map<string, LevelEntry[]>>;

  cleanupCallbacks: (() => void)[] = [];

  constructor(props: MenuTabProps) {
    super(props);
    const { x, y, scene, width, height } = props;

    this.levels = scene.cache.json.get("levels") || [];
    this.groupedLevels = this.groupLevels(this.levels);
    this.localCache = getLocal(scene);

    this.levelsContainer = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
        fontSize: "24px",
        overflow: "hidden",
      })
      .setOrigin(0, 0);
    this.levelsContainer.node.id = "level-scroll-container";
    this.container.add(this.levelsContainer);

    this.selectedLevelInfo = new SelectedLevelInfo(
      1500,
      0,
      420,
      height,
      this.actionBtn,
      scene
    );

    this.importBlock = new ImportLevel(scene, this.selectedLevelInfo);
    this.importBlock.hide();

    this.addBackButton();
    this.selectedLevelInfo.hide();
  }

  show(): void {
    super.show();
    this.showFolders();
  }

  hide(): void {
    super.hide();
    this.cleanup();
    this.selectedLevelInfo.hide();
    this.selectedLevelInfo.updateInfo(undefined);
  }

  showFolders(): void {
    this.cleanup();
    this.clearedLevels = getUserLevelsCleared();
    if (!this.levels.length) return;

    const wrapper = this.createElem("level-container");

    const mechanicRow = this.createElem("folder-row");

    for (const [folderName, categories] of this.groupedLevels.entries()) {
      const total = [...categories.values()].reduce(
        (sum, lvls) => sum + lvls.length,
        0
      );
      const cleared = [...categories.values()].reduce(
        (sum, lvls) => sum + this.countCleared(lvls),
        0
      );
      const label = `${this.localCache.levels[folderName]}`.toUpperCase();

      const progress = `${cleared}/${total}`;

      const folderBtn = this.createFolderBtn(label, folderName, progress);

      wrapper.appendChild(folderBtn);
    }
    const importBtn = this.createBtn(this.localCache.mainMenu.importBtn);
    importBtn.addEventListener("click", () => {
      this.selectedLevelInfo.show();
      this.levelsContainer.node.replaceChildren();
      this.importBlock.show();
    });
    importBtn.className = "card folder-card";
    importBtn.setAttribute("data-folder", "import");

    this.levelsContainer.node.replaceChildren(wrapper);
    wrapper.appendChild(mechanicRow);
    wrapper.appendChild(importBtn);
  }

  showSelectedFolder(folderName: string): void {
    this.cleanup();
    if (!this.levels.length) return;
    this.clearedLevels = getUserLevelsCleared();
    this.selectedFolder = folderName;

    const grouped = this.groupedLevels.get(folderName);
    if (!grouped) return;

    this.selectedLevelInfo.show();
    this.levelsContainer.node.replaceChildren();

    const wrapper = this.createElem("folder-container", "div");

    for (const [categoryName, levelList] of grouped.entries()) {
      const { cleared, total } = this.countClearedStats(levelList);

      const container = this.createElem("folder", "div");

      const label = `${this.localCache.levels[categoryName]} (${cleared}/${total})`;
      container.appendChild(this.createElem("folder-text", "p", label));

      const levelGroup = this.createElem("container");

      levelList.forEach((level, index) => {
        const levelBtn = this.createLevelBtn(
          `${index + 1}`,
          level.levelData,
          level.id
        );
        levelGroup.appendChild(levelBtn);
      });

      container.appendChild(levelGroup);
      wrapper.appendChild(container);
    }

    this.levelsContainer.node.appendChild(wrapper);
  }

  groupLevels(levels: LevelEntry[]): Map<string, Map<string, LevelEntry[]>> {
    const grouped = new Map<string, Map<string, LevelEntry[]>>();
    for (const { folderName, categoryName } of levels) {
      if (!grouped.has(folderName)) {
        grouped.set(folderName, new Map());
      }
      const categoryMap = grouped.get(folderName)!;
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
    }
    levels.forEach((level) => {
      grouped.get(level.folderName)!.get(level.categoryName)!.push(level);
    });
    return grouped;
  }

  countCleared(levels: LevelEntry[]): number {
    return levels.filter((lvl) => this.clearedLevels.has(lvl.id)).length;
  }

  countClearedStats(levels: LevelEntry[]) {
    return {
      cleared: this.countCleared(levels),
      total: levels.length,
    };
  }

  createLevelBtn(
    text: string,
    levelData: LevelData,
    key: string
  ): HTMLDivElement {
    const btn = this.createBtn(text);
    if (this.clearedLevels.has(key)) {
      btn.classList.add("cleared");
    }
    const handler = () => {
      this.selectedLevelInfo.updateInfo(
        levelData,
        key,
        this.clearedLevels.get(key)
      );
      this.selectedLevelInfo.show();
    };
    btn.addEventListener("click", handler);
    return btn;
  }

  createFolderBtn(
    text: string,
    folderName: string,
    progressText: string
  ): HTMLElement {
    const card = this.createElem("card folder-card", "button");
    const label = this.createElem("text", "label", text);
    const progress = this.createElem("folder__progress", "label", progressText);
    const img = this.createElem("folder-card__img");

    card.append(img, label, progress);
    card.setAttribute("data-folder", folderName);
    const handler = () => this.showSelectedFolder(folderName);
    card.addEventListener("click", handler);
    this.cleanupCallbacks.push(() =>
      card.removeEventListener("click", handler)
    );
    return card;
  }

  createBtn(text: string): HTMLDivElement {
    const card = this.createElem("card level-card") as HTMLDivElement;
    const label = this.createElem("text", "div", text);
    card.appendChild(label);
    return card;
  }

  createElem(cls: string, tag: string = "div", text?: string): HTMLElement {
    const elem = document.createElement(tag);
    elem.className = cls;
    if (text) elem.innerText = text;
    return elem;
  }

  private addBackButton() {
    const backBtn = new PrimaryBtn(
      80,
      this.actionBtn.container.y,
      this.localCache.mainMenu.backBtn,
      200,
      0,
      this.scene,
      () => {
        this.showFolders();
        this.selectedLevelInfo.hide();
        this.importBlock.hide();
      }
    );
    this.selectedLevelInfo.container.add(backBtn.container);
  }

  cleanup(): void {
    this.cleanupCallbacks.forEach((fn) => fn());
    this.cleanupCallbacks = [];
  }
}
