import { CellAction, ColorType, Vector2 } from "../types";
import Cell from "./Cell";
import { Game } from "../scenes/Game";

export default class ShaderCell extends Cell {
  newColor: ColorType;

  transitionStart(newColor: ColorType, startPoint: Vector2): void {
    this.newColor = newColor;
    this.tile.setUniform("colorToTransform.value", this.colors[newColor].value);
    this.tile.setUniform("startPoint.value", startPoint);
  }

  transitionEnd(): void {
    this._color = this.newColor
    this.tile.scale = 1;
    this.tile.depth = 1;
    this.tile.setUniform("transition.value", 0.0);
    this.tile.setUniform("color.value", this.colors[this.newColor].value);
  }
  transitionUpdate(progress: number): void {
    this.tile.setUniform("transition.value", progress);
  }
  tile;

  constructor(
    scene: Game,
    x: number,
    y: number,
    color: ColorType,
    gap: number = 0,
    cellSize: number,
    action: CellAction
  ) {
    super(scene, x, y, color, gap, cellSize, action);

    this.tile = scene.add
      .shader("base", 0, 0, cellSize, cellSize, [
        "celltexture",
        "cellnoise",
        "cellnoise_d",
        "cellnoise_center",
      ])
      .setOrigin(0, 0);
    this.tile.setUniform("color.value", this.colors[color].value);
    this.tile.setUniform("curPoint.value", { x, y });
    this.container.add(this.tile);
    this.createTransitionTile();
    this.setTileInteractions();
  }
  onEnter() {
    this.tile.setUniform("active.value", 1.0);
  }
  onLeave() {
    this.tile.setUniform("active.value", 0.0);
  }

  setColor(color: ColorType) {
    this._color = color;

    this.tile.setUniform("color.value", this.colors[color].value);
  }
}
