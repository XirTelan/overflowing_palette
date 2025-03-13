import { Scene } from "phaser";
import { BaseBlock } from "../common/BaseBlock";
import { Game } from "../../scenes/Game";
import { GameMode, GameStatus, LevelData, LevelsJson } from "../../types";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { getLocal } from "../../utils";

export class ResultScreen extends BaseBlock {
  scene: Game;
  nextLevelData: {
    mode: GameMode;
    levelData: LevelData;
    levelKey: string;
  };
  local;

  constructor(width: number, height: number, scene: Game) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    super(centerX - width / 2, centerY - height / 2, scene);
    this.scene = scene;

    scene.gameStates.state = GameStatus.Waiting;

    this.local = getLocal(scene).resultScreen;

    const levelKey = this.scene.gameStates.levelKey;

    this.saveRecordAboutLevel(levelKey);

    const timeElapsed = new Date(scene.time.now - scene.startTime)
      .toISOString()
      .slice(11, 19);

    this.container.add([
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.95).setOrigin(0),
      scene.add.rectangle(0, 0, width, 50, 0xffffff, 0.95).setOrigin(0),
      scene.make
        .text({
          x: width / 2,
          y: 10,
          text: this.local.win,
          style: {
            color: "#000",
            font: "32px OpenSans_Bold",
          },
        })
        .setOrigin(0.5, 0),
      scene.make.text({
        x: 10,
        y: 70,
        text: `${this.local.time} ${timeElapsed} `,
        style: {
          color: "#fff",
          font: "32px OpenSans_Bold",
        },
      }),
      new PrimaryBtn(
        width / 2 - 110,
        height - 33,
        this.local.btnMain,
        300,
        50,
        this.scene,
        () => {
          this.scene.scene.start("MainMenu");
        }
      ).container,
    ]);

    if (!levelKey) return;

    const isNextLevel = this.findNextLevel();
    if (isNextLevel) {
      this.createNextLevelBtn(width / 2 + 110, height - 33);
    }
  }
  saveRecordAboutLevel(levelKey: string) {
    const localData = localStorage.getItem("clearedLevels");
    let cache;
    if (localData) {
      const parsed = JSON.parse(localData);
      cache = new Set(parsed);
    } else {
      cache = new Set();
    }
    cache.add(levelKey);

    localStorage.setItem("clearedLevels", JSON.stringify(Array.from(cache)));
  }
  createNextLevelBtn(x: number, y: number) {
    this.container.add(
      new PrimaryBtn(x, y, this.local.btnNext, 300, 50, this.scene, () => {
        this.scene.scene.start("LoadingGame", this.nextLevelData);
      }).container
    );
  }
  findNextLevel() {
    const levelKey = this.scene.gameStates.levelKey;
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
