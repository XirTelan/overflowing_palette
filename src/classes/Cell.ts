import Grid from "./Grid";
import { ColorType, GameStatus } from "../types";
import { colors } from "../utils";

export default class Cell {
  tile;
  transitionTile;
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
      y * (cellSize + gap / 2),
      x * (cellSize + gap / 2),
      cellSize,
      cellSize,
      ["celltexture", "cellnoise", "cellnoise_d", "cellnoise_center"]
    );
    this.tile.setUniform("color.value", colors[color]);

    this.tile.setInteractive();
    this.tile.on("pointerdown", this.onClick, this);
    this.tile.on("pointerover", this.onEnter, this);
    this.tile.on("pointerout", this.onLeave, this);

    this.pos = { x, y };

    const transitionTile = grid.scene.add.shader(
      "base",
      this.tile.x,
      this.tile.y,
      cellSize,
      cellSize
    );

    transitionTile.setUniform("color.value", { x: 0.949, y: 0.953, z: 0.827 });
    transitionTile.setUniform("active.value", 1.0);
    transitionTile.setUniform("transparent.value", 1.0);

    transitionTile.setVisible(false);

    this.transitionTile = transitionTile;
  }
  onEnter() {
    this.tile.setUniform("active.value", 1.0);
  }
  onLeave() {
    this.tile.setUniform("active.value", 0.0);
  }
  onClick() {
    this.grid.cellAction(this.pos.x, this.pos.y, this.color);
  }
}
