import { Scene } from "phaser";
import { ColorType, GameConfig, GameMode, LevelData } from "../../../types";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { BaseBlock } from "../../common/BaseBlock";
import { getLocal, normalizedRgbToColor } from "../../../utils";
import { InfoBlock } from "./InfoBlock";

export class SelectedLevelInfo extends BaseBlock {
  previewBlock: PreviewBlock;
  levelInfo: InfoBlock;
  emptyBlock: Phaser.GameObjects.Text;
  actionBtn: PrimaryBtn;
  width: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    actionBtn: PrimaryBtn,
    scene: Scene
  ) {
    super(x, y, scene);

    this.width = width;

    const { selectedLevelInfo } =
      scene.cache.json.get("config")["mainMenu"]["levelSelection"];

    const { previewBlock } = getLocal(scene);

    this.container.add([
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0),
      scene.add.rectangle(0, 0, width, 45, 0x000000, 0.6).setOrigin(0, 0),
      scene.make
        .text({
          x: width / 2,
          y: 0,
          text: previewBlock.preview,
          style: {
            color: "#fff",
            font: "32px OpenSans_Bold",
          },
        })
        .setOrigin(0.5, 0),
    ]);

    this.emptyBlock = scene.make
      .text({
        ...selectedLevelInfo.emptyText,
        x: width / 2,
      })
      .setOrigin(0.5, 0);

    this.previewBlock = new PreviewBlock(10, 60, scene);
    this.levelInfo = new InfoBlock(0, 40, scene);

    this.container.add([
      this.emptyBlock,
      this.levelInfo.container,
      this.previewBlock.container,
    ]);

    if (actionBtn) {
      this.actionBtn = actionBtn;
      actionBtn.container.setPosition(width / 2 + 70, height - 50);
      actionBtn.container.parentContainer.remove(actionBtn.container);
      actionBtn.container.setScale(1);

      this.container.add(actionBtn.container);

      actionBtn.hide();
    }
    this.previewBlock.hide();
    this.levelInfo.hide();
  }
  updateInfo(
    levelData: LevelData | undefined,
    levelKey?: string,
    clearedLevel?: {
      time: string;
    }
  ) {
    if (!levelData) {
      this.actionBtn.hide();
      this.previewBlock.hide();
      this.levelInfo.hide();
      this.emptyBlock.setVisible(true);
      return;
    }
    this.actionBtn.container.setVisible(true);
    this.levelInfo.update(String(levelData.turns), levelData, clearedLevel);
    this.levelInfo.container.setVisible(true);

    this.previewBlock.updatePreview(levelData.board);
    this.previewBlock.container.setVisible(true);

    this.actionBtn.btn.on("pointerdown", () => {
      this.scene.scene.start("LoadingGame", {
        mode: GameMode.Play,
        levelKey,
        levelData,
      });
    });
    this.emptyBlock.setVisible(false);
  }
}

class PreviewBlock extends BaseBlock {
  graphics: Phaser.GameObjects.Graphics;
  constructor(x: number, y: number, scene: Scene) {
    super(x, y, scene);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);
  }
  updatePreview(level: LevelData["board"]) {
    const { selectedLevelInfo } =
      this.scene.cache.json.get("config")["mainMenu"]["levelSelection"];

    const { colors } = this.scene.cache.json.get("config") as GameConfig;

    const rows = level.length;
    const cols = level[0].length;

    const originalWidth = cols * selectedLevelInfo.previewBlock.cellSize;
    const originalHeight = rows * selectedLevelInfo.previewBlock.cellSize;

    const scaleX = selectedLevelInfo.previewBlock.width / originalWidth;
    const scaleY = selectedLevelInfo.previewBlock.height / originalHeight;
    const finalScale = Math.min(scaleX, scaleY);

    const graphics = this.graphics;
    graphics.setScale(finalScale);
    this.container.setPosition(
      (selectedLevelInfo.previewBlock.width - originalWidth * finalScale) / 2,
      this.container.y
    );

    graphics.clear();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const color = colors[level[i][j] as ColorType].value;
        graphics.fillStyle(normalizedRgbToColor(color));
        graphics.fillRect(j * 50, i * 50, 50, 50);
      }
    }
  }
}
class InfoBlock {
  scene: Scene;
  container: Phaser.GameObjects.DOMElement;
  turnsText: HTMLElement;
  tartgetColorText: HTMLElement;
  author: HTMLElement;
  gridSize: HTMLElement;
  clearedBlock: ClearedBlock;

  constructor(x: number, y: number, scene: Scene) {
    this.scene = scene;

    const vieBox = scene.add
      .dom(x, 380, "div", {
        width: `420px`,
        height: `500px`,
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0);

    this.container = vieBox;

    const container = document.createElement("div");

    container.classList.add("info-block");

    vieBox.node.append(container);

    this.tartgetColorText = this.addRecord("Target Color:", "red");
    this.turnsText = this.addRecord("Moves:", "0");
    this.author = this.addRecord("Author:", "");
    this.gridSize = this.addRecord("Grid Size:", "");

    this.clearedBlock = new ClearedBlock();
    this.clearedBlock.hide();

    container.appendChild(this.turnsText);
    container.appendChild(this.tartgetColorText);
    container.appendChild(this.author);
    container.appendChild(this.gridSize);
    container.appendChild(this.clearedBlock.container);
  }
  addRecord(text: string, value: string, overrideClass?: string) {
    return new Record(
      text,
      value,
      overrideClass ?? "preview-item",
      "preview-item__label",
      "preview-item__value"
    ).container;
  }

  update(turns: string, levelData: LevelData, cleared?: ClearedData) {
    const { colors } = this.scene.cache.json.get("config") as GameConfig;
    this.tartgetColorText.childNodes[1].textContent = `${
      colors[levelData.targetColor as ColorType].colorName
    }`;
    const { x, y, z } = colors[levelData.targetColor as ColorType].value;
    const textElement = this.tartgetColorText.childNodes[1] as HTMLElement;
    textElement.style.color = Phaser.Display.Color.RGBToString(
      x * 255,
      y * 255,
      z * 255
    );

    this.turnsText.childNodes[1].textContent = turns;
    this.gridSize.childNodes[1].textContent = `${levelData.board.length}x${levelData.board[0].length} `;

    if (levelData.author) {
      this.author.style.display = "flex";
      this.author.childNodes[1].textContent = levelData.author;
    } else {
      this.author.style.display = "none";
    }

    if (cleared) {
      this.clearedBlock.show();
      this.clearedBlock.time.textContent = cleared.time;
    } else {
      this.clearedBlock.hide();
    }
  }
  hide() {
    this.container.setVisible(false);
  }
}

type ClearedData = {
  time: string;
};

class ClearedBlock {
  container: HTMLElement;
  time: HTMLElement;

  constructor() {
    const container = document.createElement("div");

    const text = document.createElement("p");
    text.classList.add("preview-item-cleared");
    //[TASK][i18n]
    text.textContent = "CLEARED";

    const timeRecord = new Record(
      "Time",
      "A long time ago",
      "preview-item",
      "preview-item__label",
      "preview-item__value"
    );

    container.appendChild(text);
    container.appendChild(timeRecord.container);

    this.time = timeRecord.value;
    this.container = container;
  }

  hide() {
    this.container.style.display = "none";
  }
  show() {
    this.container.style.display = "block";
  }
}
