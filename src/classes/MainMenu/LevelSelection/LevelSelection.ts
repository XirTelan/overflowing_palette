import { MenuTab } from "../MenuTab";
import {
  LanguageConfig,
  LevelCategory,
  LevelData,
  LevelFolder,
  LevelsJson,
  MenuTabProps,
} from "../../../types";
import { SelectedLevelInfo } from "./SelectedLevelInfo";
import { ImportLevel } from "./Import";
import { getLocal, getUserLevelsCleared } from "../../../utils";
import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";

export class LevelSelection extends MenuTab {
  selectedLevelData: LevelData;
  selectedFolder: string;
  selectedLevelInfo: SelectedLevelInfo;
  levelsList: Phaser.GameObjects.DOMElement;

  localCache: LanguageConfig;

  clearedLevels: Map<any, any>;
  importBlock: ImportLevel;

  constructor(props: MenuTabProps) {
    super(props);
    const { x, y, scene, width, height } = props;
    this.levelsList = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0, 0);
    this.levelsList.node.id = "boxid";

    this.container.add(this.levelsList);

    const contentContainer = document.createElement("div");

    this.selectedLevelInfo = new SelectedLevelInfo(
      x + width,
      y,
      scene.cameras.main.width - x - width,
      height,
      this.actionBtn,
      scene
    );
    this.importBlock = new ImportLevel(this.scene);
    this.importBlock.hide();
    const local = getLocal(scene);
    this.localCache = local;

    this.selectedLevelInfo.container.add(
      new PrimaryBtn(
        80,
        this.actionBtn.container.y,
        local.mainMenu.backBtn,
        200,
        0,
        scene,
        () => {
          this.showFolders();
          this.selectedLevelInfo.hide();
        }
      ).container
    );

    this.levelsList.node.append(contentContainer);

    this.levelsList.node.id = "boxid";
    this.selectedLevelInfo.hide();
    this.showFolders();
  }

  showSelectedFolder(folder: LevelFolder) {
    const levels: LevelsJson | undefined = this.scene.cache.json.get("levels");
    if (!levels) return;

    this.levelsList.node.replaceChildren();

    const levelContainer = document.createElement("div");
    levelContainer.classList.add("folder-container");

    this.levelsList.node.appendChild(levelContainer);

    this.selectedFolder = folder.folderName;
    this.selectedLevelInfo.show();

    const cache = getUserLevelsCleared();

    this.clearedLevels = cache;

    for (const category of folder.categories) {
      levelContainer.append(this.createCategory(category));
    }
  }

  showFolders() {
    const levels: LevelsJson | undefined = this.scene.cache.json.get("levels");
    if (!levels) return;

    this.levelsList.node.replaceChildren();

    const levelContainer = document.createElement("div");
    levelContainer.classList.add("level-container");

    const local = getLocal(this.scene);

    this.levelsList.node.appendChild(levelContainer);

    for (const folder of levels) {
      levelContainer.appendChild(
        this.createFolderBtn(local.levels[folder.folderName], folder)
      );
    }
    const importBtn = this.createBtn(this.localCache.mainMenu.importBtn);
    importBtn.addEventListener("click", () => {
      this.importBlock.show();
    });
    levelContainer.appendChild(importBtn);
  }
  createLvlBtn(text: string, levelData: LevelData, key: string) {
    const card = this.createBtn(text);
    if (key && this.clearedLevels.has(key)) {
      card.classList.add("cleared");
    }
    card.addEventListener("click", () => {
      this.selectedLevelInfo.updateInfo(
        levelData,
        key,
        this.clearedLevels.get(key)
      );
    });
    return card;
  }
  createFolderBtn(text: string, levelFolder: LevelFolder) {
    const card = this.createBtn(text);
    card.addEventListener("click", () => {
      this.showSelectedFolder(levelFolder);
    });
    return card;
  }
  createBtn(text: string) {
    const card = document.createElement("div");
    const textBlock = document.createElement("div");
    textBlock.innerText = text;
    textBlock.classList.add("text");

    card.classList.add("level-card");
    card.append(textBlock);
    return card;
  }

  createCategory(category: LevelCategory) {
    const folderContainer = document.createElement("div");
    const folderName = document.createElement("h3");

    folderName.classList.add("folder-text");
    folderName.innerText = this.localCache.levels[category.categoryName];
    folderContainer.append(folderName);

    const levels = document.createElement("div");
    levels.classList.add("container");

    category.levels.forEach((level, indx) => {
      levels.append(
        this.createLvlBtn(
          String(indx + 1),
          level,
          `${this.selectedFolder}.${category.categoryName}.${indx + 1}`
        )
      );
    });

    folderContainer.append(levels);

    folderContainer.classList.add("folder");

    return folderContainer;
  }

  show(): void {
    super.show();
    this.showFolders();
  }
  hide(): void {
    super.hide();
    this.selectedLevelInfo.hide();
    this.selectedLevelInfo.updateInfo(undefined);
  }
}
