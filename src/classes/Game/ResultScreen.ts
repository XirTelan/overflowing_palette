import { Game } from "@/scenes/Game";
import { GameSceneData, LanguageConfig, GameStatus, GameMode, LevelsJson } from "@/types";
import { getLocal, generateLevel, getUserLevelsCleared } from "@/utils";
import { BaseBlock } from "../common/BaseBlock";
import { PrimaryBtn } from "../ui/buttons/PrimaryBtn";
import { Record } from "../ui/html/Record";


export class ResultScreen extends BaseBlock {
  scene: Game;
  nextLevelData: GameSceneData;
  local: LanguageConfig["resultScreen"];

  constructor(scene: Game) {
    scene.cameras.main.postFX.addBlur(1);

    const { width, height } = scene.cameras.main;

    const centerX = width / 2;
    const centerY = height / 2;

    super(centerX - width / 2, centerY - height / 2, scene);

    this.scene = scene;

    scene.gameStates.state = GameStatus.Waiting;

    const { resultScreen } = getLocal(scene);
    this.local = resultScreen;

    const levelKey = this.scene.gameStates.levelKey;

    const timeElapsed = new Date(scene.time.now - scene.startTime)
      .toISOString()
      .slice(11, 19);

    this.saveRecordAboutLevel(levelKey, timeElapsed);

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);
    viewBox.depth = 2;

    const resultContent = this.createResultContent(viewBox.node, timeElapsed);
    const buttonBlock = this.createButtonsBlock(resultContent);

    const isEndless = this.scene.gameStates.mode === GameMode.Endless;
    let isNextLevel;

    if (isEndless) {
      isNextLevel = this.generateNextLevel();
    } else {
      isNextLevel = this.findNextLevel();
    }

    if (isNextLevel) {
      const btn = document.createElement("button");
      btn.classList.add("primary-btn");
      btn.addEventListener("click", () => {
        this.scene.scene.start("LoadingGame", this.nextLevelData);
      });
      btn.textContent = resultScreen.btnNext;
      buttonBlock.append(btn);
    }

    scene.input.enabled = false;
    scene.setGameState(GameStatus.Waiting);
  }

  generateNextLevel() {
    if (!this.scene.gameStates.endlessOptions) return false;

    const { rows, columns, colorsCount, difficulty } =
      this.scene.gameStates.endlessOptions!;

    this.nextLevelData = {
      mode: GameMode.Endless,
      levelData: generateLevel(rows, columns, colorsCount, difficulty),
      endlessOptions: this.scene.gameStates.endlessOptions,
    };
    return true;
  }

  createResultContent(viewBox: Element, time: string) {
    const container = document.createElement("div");
    container.classList.add("wrapper", "results-screen__wrapper");

    const content = document.createElement("div");
    content.classList.add("result-screen");
    container.appendChild(content);

    const textBlock = document.createElement("div");
    textBlock.classList.add("result-screen__cleared");
    textBlock.textContent = this.local.win;
    const textBlockBg = document.createElement("div");
    textBlockBg.classList.add("cleared-bg");

    textBlock.append(textBlockBg);

    content.appendChild(textBlock);

    const resultsBlock = document.createElement("div");
    resultsBlock.classList.add("results");
    content.appendChild(resultsBlock);

    const timeRecord = this.addRecord(this.local.time, time);
    resultsBlock.appendChild(timeRecord);

    if (this.scene.gameStates.mode === GameMode.Endless) {
      const turnUsed = this.addRecord(
        this.local.movesUsed,
        String(this.scene.gameStates.turns)
      );
      resultsBlock.appendChild(turnUsed);
    }

    viewBox.appendChild(container);
    return container;
  }

  createButtonsBlock(container: HTMLElement) {
    const buttonsBlock = document.createElement("div");
    buttonsBlock.classList.add("results_buttons");

    const btn = this.createPrimiryBtn(this.local.btnMain, () => {
      this.scene.scene.start("MainMenu");
    });
    buttonsBlock.append(btn);

    if (this.scene.gameStates.mode === GameMode.Endless) {
      const shareBtn = this.createShareButton();
      buttonsBlock.append(shareBtn);
    }

    container.appendChild(buttonsBlock);
    return buttonsBlock;
  }

  createPrimiryBtn(text: string, onClick: () => void) {
    const btn = document.createElement("button");
    btn.classList.add("primary-btn");
    btn.textContent = text;
    btn.addEventListener("click", () => {
      onClick();
    });
    return btn;
  }

  createShareButton() {
    const btn = this.createPrimiryBtn(this.local.btnShare, () => {
      this.scene.exportBlock.show();
    });
    return btn;
  }

  saveRecordAboutLevel(levelKey: string, time: string) {
    if (!levelKey) return;

    const cache = getUserLevelsCleared();

    cache.set(levelKey, {
      time,
    });

    localStorage.setItem("levels.cleared", JSON.stringify(Array.from(cache)));
  }
  addRecord(text: string, value: string) {
    return new Record(
      text,
      value,
      "results__item",
      "results__label",
      "results__value"
    ).container;
  }
  createNextLevelBtn(x: number, y: number) {
    this.container.add(
      new PrimaryBtn(x, y, this.local.btnNext, 300, 50, this.scene, () => {
        this.scene.scene.start("LoadingGame", this.nextLevelData);
        this.scene.cameras.main.postFX.clear();
      }).container
    );
  }
  findNextLevel() {
    const levelKey = this.scene.gameStates.levelKey;
    if (!levelKey) return false;

    const [folderName, categoryName, indx] = levelKey.split(".");
    if (!folderName || !categoryName || !indx) return false;
    const levels: LevelsJson = this.scene.cache.json.get("levels");

    const currentFolderIndex = levels.findIndex(
      (folder) => folder.folderName === folderName
    );
    const currentFolder = levels[currentFolderIndex];
    const currentCategoryIndex = currentFolder.categories.findIndex(
      (category) => category.categoryName === categoryName
    );
    const currentCategory = currentFolder.categories[currentCategoryIndex];

    const levelsCount = currentCategory.levels.length;

    let nextFolderIndx = currentFolderIndex;
    let nextCategoryIndx = currentCategoryIndex;
    let nextLevelIndx = Number(indx) - 1;

    if (nextLevelIndx < levelsCount - 1) {
      nextLevelIndx++;
    } else {
      nextLevelIndx = 0;
      nextCategoryIndx++;
    }

    if (!currentFolder.categories[nextCategoryIndx]) {
      nextCategoryIndx = 0;
      nextFolderIndx++;
    }

    if (!levels[nextFolderIndx]) {
      return false;
    }

    const nextFolder = levels[nextFolderIndx];
    const nextCategory = nextFolder.categories[nextCategoryIndx];

    const newKey = `${nextFolder.folderName}.${
      nextFolder.categories[nextCategoryIndx].categoryName
    }.${nextLevelIndx + 1}`;

    this.nextLevelData = {
      mode: GameMode.Play,
      levelKey: newKey,
      levelData: nextCategory.levels[nextLevelIndx],
    };

    return true;
  }
}
