import { Game } from "@/scenes/Game";
import { BlendModes } from "phaser";
import { EditorManager } from "./EditorManager";
import Cell from "@/classes/Cell";

export abstract class BaseCellEditor {
  scene: Game;
  manager: EditorManager;
  board: Cell[][];
  tileSize: number;
  container: Phaser.GameObjects.Container;

  constructor(scene: Game, manager: EditorManager) {
    this.scene = scene;
    this.manager = manager;
    this.board = scene.grid.board;
    this.tileSize = scene.grid.cellSize;

    this.container = this.scene.add.container(
      this.scene.grid.container.x,
      this.scene.grid.container.y
    );

    this.renderBoard();
    this.container.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }

  private renderBoard() {
    const rows = this.board.length;
    const columns = this.board[0].length;
    const gap = this.scene.cache.json.get("config").game.gridOptions.gap;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const x = j * (this.tileSize + gap);
        const y = i * (this.tileSize + gap);
        const tile = this.scene.add
          .rectangle(x, y, this.tileSize, this.tileSize, 0xaaaaaa)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .setBlendMode(BlendModes.MULTIPLY);

        tile.on("pointerover", () => tile.setFillStyle(0xcccccc));
        tile.on("pointerout", () => tile.setFillStyle(0xaaaaaa));
        tile.on("pointerdown", () => this.handleTileClick(i, j));

        this.container.add(tile);
      }
    }
  }

  protected abstract handleTileClick(x: number, y: number): void;
  abstract isCellAvailable(x: number, y: number): boolean;
  abstract getValues(): unknown[];
}
