import { Game } from "../scenes/Game";
import { ColorType, CellAction } from "../types";
import Cell from "./Cell";

export class BlockedCell extends Cell {
  onEnter(): void {}
  onLeave(): void {}
  setColor(_color: ColorType): void {}
  transitionStart(_args: any[]): void {}
  transitionEnd(): void {}
  transitionUpdate(_progress: number): void {}
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
      .image(0, 0, "blockedTile")
      .setOrigin(0, 0)
      .setScale(this.tileScale);
    this.container.add(this.tile);
    this.setTileInteractions();
  }
}
