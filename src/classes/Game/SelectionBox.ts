import Grid from "../Grid";
import Cell from "../Cell";
import { Game } from "../../scenes/Game";

const MIN_DRAG_DISTANCE = 50;

export class SelectionBox {
  scene: Game;
  board: Grid["board"];
  graphics: Phaser.GameObjects.Graphics;
  selectionBox?: Phaser.Geom.Rectangle;
  selectedObjects: Cell[] = [];
  isSelecting = false;
  startX: number;
  startY: number;
  objectList: Cell[];

  constructor(board: Grid["board"], scene: Game) {
    this.scene = scene;
    this.board = board;

    const { selectionBox } = scene.cache.json.get("config")["game"];
    this.graphics = scene.add.graphics(selectionBox);

    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
  }

  onPointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.x < 250 || pointer.x > 1400) return;
    this.isSelecting = true;
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.selectionBox = new Phaser.Geom.Rectangle(
      this.startX,
      this.startY,
      0,
      0
    );
  }

  onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.selectionBox || !this.isSelecting) return;

    this.selectionBox.width = pointer.x - this.startX;
    this.selectionBox.height = pointer.y - this.startY;

    this.redrawSelectionBox();
  }

  onPointerUp() {
    if (!this.selectionBox) return;

    this.isSelecting = false;
    this.graphics.clear();

    this.selectionBox = this.normalizeRect(this.selectionBox);

    if (
      this.selectionBox.width < MIN_DRAG_DISTANCE ||
      this.selectionBox.height < MIN_DRAG_DISTANCE
    ) {
      return;
    }

    const cellSize = this.scene.grid.cellSize / 2;
    const selected: Cell[] = [];

    for (const cell of this.board.flat()) {
      const { x, y } = cell.tile.getWorldPoint();
      const centerPoint = new Phaser.Geom.Point(x + cellSize, y + cellSize);

      if (Phaser.Geom.Rectangle.ContainsPoint(this.selectionBox, centerPoint)) {
        cell.onClick();
        selected.push(cell);
      }
    }

    this.selectedObjects = selected;
    this.selectionBox = undefined;
  }

  redrawSelectionBox() {
    if (!this.selectionBox) return;

    this.graphics.clear();
    this.graphics
      .fillStyle(0x000000, 0.4)
      .fillRectShape(this.selectionBox)
      .lineStyle(2, 0xffffff)
      .strokeRectShape(this.selectionBox);
  }

  normalizeRect(rect: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle {
    const x = Math.min(rect.x, rect.x + rect.width);
    const y = Math.min(rect.y, rect.y + rect.height);
    const width = Math.abs(rect.width);
    const height = Math.abs(rect.height);
    return new Phaser.Geom.Rectangle(x, y, width, height);
  }

  destroy() {
    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.graphics.destroy();
  }
}
