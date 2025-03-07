import { MenuTab } from "../MenuTab";
import {
  LevelCategory,
  LevelData,
  LevelFolder,
  LevelsJson,
  MenuTabProps,
} from "../../../types";
import { SelectedLevelInfo } from "./SelectedLevelInfo";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { ImportLevel } from "./Import";

export class LevelSelection extends MenuTab {
  selectedLevelData: LevelData;
  selectedFolder: string;
  selectedLevelInfo: SelectedLevelInfo;
  levelsList: Phaser.GameObjects.DOMElement;
  clearedLevels: Set<string>;
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
      scene.cameras.main.width - x - width - 10,
      height,
      this.actionBtn,
      scene
    );

    this.selectedLevelInfo.container.add(
      new PrimaryBtn(
        80,
        this.actionBtn.container.y,
        "Back",
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
    this.selectedFolder = folder.folderName;
    this.selectedLevelInfo.show();

    const localData = localStorage.getItem("clearedLevels");
    let cache;
    if (localData) {
      const parsed = JSON.parse(localData);
      cache = new Set<string>(parsed);
    } else {
      cache = new Set<string>();
    }
    this.clearedLevels = cache;

    for (const category of folder.categories) {
      this.levelsList.node.append(this.createCategory(category));
    }
  }

  showFolders() {
    const levels: LevelsJson | undefined = this.scene.cache.json.get("levels");
    if (!levels) return;

    this.levelsList.node.replaceChildren();

    for (const folder of levels) {
      this.levelsList.node.append(
        this.createFolderBtn(folder.folderName, folder)
      );
    }
    const importBtn = this.createBtn("Import");
    importBtn.addEventListener("click", () => {
      const btn = new ImportLevel(this.scene);
      btn.render();
    });
    this.levelsList.node.append(importBtn);
  }
  createLvlBtn(text: string, levelData: LevelData, key: string) {
    const card = this.createBtn(text);
    if (key && this.clearedLevels.has(key)) {
      card.classList.add("cleared");
    }
    card.addEventListener("click", () => {
      this.selectedLevelInfo.updateInfo(levelData, key);
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
    folderName.innerText = category.categoryName;
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
  hide(isForce?: boolean): void {
    super.hide();
    this.selectedLevelInfo.hide();
    this.selectedLevelInfo.updateInfo(undefined);
  }
}
