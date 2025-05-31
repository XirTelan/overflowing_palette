import { Game } from "@/scenes/Game";
import {
  GameSceneData,
  LanguageConfig,
  GameStatus,
  GameMode,
  LevelEntry,
} from "@/types";
import {
  getLocal,
  generateLevel,
  getUserLevelsCleared,
  findNextLevel,
  localStoragePrefix,
} from "@/utils";
import { BaseBlock } from "../common/BaseBlock";
import { Record } from "../ui/html/Record";

export class ResultScreen extends BaseBlock {
  scene: Game;
  nextLevelData?: GameSceneData;
  local: LanguageConfig["resultScreen"];

  constructor(scene: Game) {
    const { width, height } = scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    super(centerX - width / 2, centerY - height / 2, scene);

    this.scene = scene;
    this.local = getLocal(scene).resultScreen;

    this.scene.cameras.main.postFX.addBlur(1);
    this.scene.setGameState(GameStatus.Waiting);

    const timeElapsed = new Date(scene.time.now - scene.startTime)
      .toISOString()
      .slice(11, 19);

    this.saveRecordAboutLevel(this.scene.gameStates.levelKey, timeElapsed);

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);
    viewBox.depth = 2;

    const resultContent = this.createResultContent(viewBox.node, timeElapsed);
    const buttonBlock = this.createButtonsBlock(resultContent);
    const levels: LevelEntry[] = scene.cache.json.get("levels") || [];
    const isEndless = this.scene.gameStates.mode === GameMode.Endless;
    const hasNextLevel = isEndless
      ? this.generateNextLevel()
      : !!(this.nextLevelData = findNextLevel(
          this.scene.gameStates.levelKey,
          levels
        ));

    if (hasNextLevel) {
      const nextBtn = this.createNextLevelBtn();
      buttonBlock.append(nextBtn);
    }

    this.scene.input.enabled = false;
  }

  generateNextLevel(): boolean {
    const options = this.scene.gameStates.endlessOptions;
    if (!options) return false;

    this.nextLevelData = {
      mode: GameMode.Endless,
      levelData: generateLevel(
        options.rows,
        options.columns,
        options.colorsCount,
        options.difficulty,
        options.mehanics
      ),
      endlessOptions: options,
    };

    return true;
  }

  createResultContent(viewBox: Element, time: string): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("wrapper", "results-screen__wrapper");

    const content = document.createElement("div");
    content.classList.add("result-screen");
    container.appendChild(content);

    const clearedText = document.createElement("div");
    clearedText.classList.add("result-screen__cleared");
    clearedText.textContent = this.local.win;

    const clearedBg = document.createElement("div");
    clearedBg.classList.add("cleared-bg");
    clearedText.append(clearedBg);

    content.appendChild(clearedText);

    const resultsBlock = document.createElement("div");
    resultsBlock.classList.add("results");
    content.appendChild(resultsBlock);

    resultsBlock.appendChild(this.addRecord(this.local.time, time));

    if (this.scene.gameStates.mode === GameMode.Endless) {
      resultsBlock.appendChild(
        this.addRecord(
          this.local.movesUsed,
          String(this.scene.gameStates.turns)
        )
      );
    }

    viewBox.appendChild(container);
    return container;
  }

  createButtonsBlock(container: HTMLElement): HTMLElement {
    const buttonsBlock = document.createElement("div");
    buttonsBlock.classList.add("results_buttons");

    const mainMenuBtn = this.createPrimaryBtn(this.local.btnMain, () => {
      this.scene.scene.start("MainMenu");
    });
    buttonsBlock.append(mainMenuBtn);

    if (this.scene.gameStates.mode === GameMode.Endless) {
      const shareBtn = this.createPrimaryBtn(this.local.btnShare, () => {
        this.scene.exportBlock.show();
      });
      buttonsBlock.append(shareBtn);
    }

    container.appendChild(buttonsBlock);
    return buttonsBlock;
  }

  createPrimaryBtn(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.classList.add("primary-btn");
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  saveRecordAboutLevel(levelKey: string, time: string) {
    if (!levelKey) return;

    const cache = getUserLevelsCleared();
    cache.set(levelKey, { time });

    localStorage.setItem(
      `${localStoragePrefix}levels.cleared`,
      JSON.stringify(Array.from(cache))
    );
  }

  addRecord(label: string, value: string): HTMLElement {
    return new Record(
      label,
      value,
      "results__item",
      "results__label",
      "results__value"
    ).container;
  }

  createNextLevelBtn() {
    return this.createPrimaryBtn(this.local.btnNext, this.nextLevel.bind(this));
  }
  nextLevel() {
    this.scene.scene.start("LoadingGame", this.nextLevelData);
    this.scene.cameras.main.postFX.clear();
  }
}
