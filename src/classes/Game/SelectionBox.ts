import { Scene } from "phaser";
import Grid from "../Grid";
import Cell from "../Cell";
import { Game } from "../../scenes/Game";

export class SelectionBox {
  scene: Game;
  graphics: Phaser.GameObjects.Graphics;
  selectionBox: Phaser.Geom.Rectangle;
  selectedObjects = [];
  isSelecting = false;
  startX: number;
  startY: number;
  objectList: Cell[];

  constructor(board: Grid["board"], scene: Game) {
    this.scene = scene;
    const { selectionBox } = scene.cache.json.get("config")["game"];
    this.graphics = scene.add.graphics(selectionBox);
    this.objectList = board.flat();

    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
  }
  onPointerDown(pointer: Phaser.Input.Pointer) {
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
    if (this.isSelecting) {
      console.log("test");
      this.selectionBox.width = pointer.x - this.startX;
      this.selectionBox.height = pointer.y - this.startY;
      this.redrawSelectionBox();
    }
  }
  onPointerUp() {
    this.isSelecting = false;
    this.graphics.clear();

    this.selectedObjects = [];

    const selectionBox = this.selectionBox;

    selectionBox.x = Math.min(
      selectionBox.x,
      selectionBox.x + selectionBox.width
    );
    selectionBox.width = Math.abs(selectionBox.width);
    selectionBox.y = Math.min(
      selectionBox.y,
      selectionBox.y + selectionBox.height
    );
    selectionBox.height = Math.abs(selectionBox.height);

    const cellSize = this.scene.grid.cellSize / 2;
    this.objectList.forEach((cell) => {
      const { x, y } = cell.tile.getWorldPoint();

      if (
        x + cellSize > selectionBox.x &&
        x + cellSize < selectionBox.x + selectionBox.width &&
        y + cellSize > selectionBox.y &&
        y + cellSize < selectionBox.y + selectionBox.height
      ) {
        cell.onClick();
      }
    });
  }

  redrawSelectionBox() {
    this.graphics.clear().fillRectShape(this.selectionBox);
  }
}
