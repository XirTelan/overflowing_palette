import { Record } from "@/classes/ui/html/Record";
import { LevelData, ColorType, LanguageConfig } from "@/types";
import { getLocal, getConfig } from "@/utils";
import { Scene } from "phaser";

export class InfoBlock {
  scene: Scene;
  container: Phaser.GameObjects.DOMElement;
  turnsText: HTMLElement;
  tartgetColorText: HTMLElement;
  author: HTMLElement;
  gridSize: HTMLElement;
  clearedBlock: ClearedBlock;

  constructor(x: number, y: number, scene: Scene) {
    this.scene = scene;

    const { previewBlock } = getLocal(scene);

    const vieBox = scene.add
      .dom(x, y, "div", {
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

    this.tartgetColorText = this.addRecord(previewBlock.targetColor, "red");
    this.turnsText = this.addRecord(previewBlock.moves, "0");
    this.author = this.addRecord(previewBlock.author, "");
    this.gridSize = this.addRecord(previewBlock.gridSize, "");

    this.clearedBlock = new ClearedBlock(previewBlock);
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
    const { colors } = getConfig(this.scene);
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

  constructor(previewBlock: LanguageConfig["previewBlock"]) {
    const container = document.createElement("div");

    const textBlock = document.createElement("p");
    textBlock.classList.add("preview-item-cleared");
    textBlock.textContent = previewBlock.cleared;

    const timeRecord = new Record(
      previewBlock.time,
      previewBlock.timeDefault,
      "preview-item",
      "preview-item__label",
      "preview-item__value"
    );

    container.appendChild(textBlock);
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
