import Grid from "./Grid";
import { ColorType } from "./types";
import { colors } from "./utils";

export default class Cell {
  tile;
  color: ColorType;
  grid;

  pos: { x: number; y: number };
  constructor(
    grid: Grid,
    x: number,
    y: number,
    color: ColorType,
    gap: number = 0,
    cellSize: number = 100
  ) {
    this.color = color;
    this.grid = grid;

    this.tile = grid.scene.add.shader(
      "base",
      y * (cellSize + gap),
      x * (cellSize + gap),
      cellSize,
      cellSize
    );
    this.tile.setUniform("color.value", colors[color]);
    this.tile.setInteractive();
    this.tile.on("pointerdown", this.onClick, this);
    this.pos = { x, y };
  }

  onClick() {
    this.grid.flip(this.pos.x, this.pos.y, this.color);
  }
}
