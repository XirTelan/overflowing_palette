import { CellAction, ColorType, Vector3 } from "../types";
import Cell from "./Cell";
import { Game } from "../scenes/Game";

export default class SimpleCell extends Cell {
  transitionStart(newColor: ColorType): void {
    this._color = Number(newColor);
    this.tile.setTintFill(vector3ToHexNumber(this.colors[newColor].value));
  }
  transitionEnd(): void {}
  transitionUpdate(_progress: number): void {}
  tile;

  constructor(
    scene: Game,
    x: number,
    y: number,
    color: ColorType,
    gap: number,
    cellSize: number,
    action: CellAction
  ) {
    super(scene, x, y, color, gap, cellSize, action);
    this.tile = scene.add
      .image(0, 0, "tile")
      .setOrigin(0, 0)
      .setScale(this.tileScale)
      .setTintFill(vector3ToHexNumber(this.colors[color].value));
    this.container.add(this.tile);
    this.createTransitionTile();
    this.setTileInteractions();
  }
  onEnter() {
    this.transitionTile.setVisible(true);
  }
  onLeave() {
    this.transitionTile.setVisible(false);
  }

  setColor(color: ColorType) {
    this._color = color;
    this.tile.setTintFill(vector3ToHexNumber(this.colors[color].value));
  }
}

function vector3ToHexNumber({ x, y, z }: Vector3) {
  const r = Math.round(x * 255);
  const g = Math.round(y * 255);
  const b = Math.round(z * 255);

  return (r << 16) | (g << 8) | b;
}
