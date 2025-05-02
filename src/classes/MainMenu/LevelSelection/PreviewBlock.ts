import { Scene } from "phaser";
import { BaseBlock } from "../../common/BaseBlock";
import { LevelData, GameConfig, ColorType } from "@/types";
import { normalizedRgbToColor } from "@/utils";

const CELL_SIZE = 50;
const STROKE_THIK = 4;

export class PreviewBlock extends BaseBlock {
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
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        const cellValue = level[i][j];

        if (cellValue === -1) {
          drawBlockedCell(graphics, x, y);
        } else {
          const color = colors[cellValue as ColorType].value;
          drawColoredCell(graphics, x, y, normalizedRgbToColor(color));
        }
      }
    }
  }
}

function drawBlockedCell(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number
) {
  graphics.fillStyle(0x000000);
  graphics.lineStyle(STROKE_THIK, 0x000000);
  graphics.lineBetween(x, y, x + CELL_SIZE, y + CELL_SIZE);
  graphics.lineBetween(x, y + CELL_SIZE, x + CELL_SIZE, y);
  graphics.strokeRect(x, y, CELL_SIZE - STROKE_THIK, CELL_SIZE - STROKE_THIK);
}

function drawColoredCell(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number
) {
  graphics.fillStyle(color);
  graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}
