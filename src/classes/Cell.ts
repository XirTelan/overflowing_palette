import Grid from "./Grid";
import { ColorType } from "../types";

export default class Cell {
  tile;
  transitionTile;
  color: ColorType;
  colors;
  grid;

  pos: { x: number; y: number };
  constructor(
    grid: Grid,
    x: number,
    y: number,
    color: ColorType,
    gap: number = 0
  ) {
    this.color = color;
    this.grid = grid;
    const { cellSize, scene } = grid;

    const { colors } = scene.cache.json.get("config");
    this.colors = colors;

    this.tile = scene.add
      .shader(
        "base",
        y * (cellSize + gap),
        x * (cellSize + gap),
        cellSize,
        cellSize,
        ["celltexture", "cellnoise", "cellnoise_d", "cellnoise_center"]
      )
      .setOrigin(0, 0);
    this.tile.setUniform("color.value", colors[color]);
    this.tile.setInteractive();
    this.tile.on("pointerdown", this.onClick, this);
    this.tile.on("pointerover", this.onEnter, this);
    this.tile.on("pointerout", this.onLeave, this);

    this.pos = { x, y };

    const transitionTile = scene.add.shader(
      "base",
      this.tile.x + cellSize / 2,
      this.tile.y + cellSize / 2,
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
  setColor(color: ColorType) {
    this.color = color;

    this.tile.setUniform("color.value", this.colors[color]);
  }
}
