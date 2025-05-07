import { Game } from "@/scenes/Game";
import { GameConfig, Portal, Position } from "@/types";
import { BlendModes } from "phaser";
import Cell from "../Cell";
import { BaseBtn } from "../ui/buttons/BaseBtn";

export class PortalEditor {
  scene: Game;
  board: Cell[][];
  tileSize: number;
  portals: Portal[];
  selected: Position[] = [];
  container: Phaser.GameObjects.Container;
  openBtn: BaseBtn;
  openBtnTexture: Phaser.GameObjects.Image;

  constructor(scene: Game) {
    this.scene = scene;
    this.board = scene.grid.board;
    this.portals = scene.grid.portals ?? [];
    this.tileSize = scene.grid.cellSize;

    this.renderBoard();
    this.createOpener();
    this.container.setVisible(false);
  }
  private createOpener() {
    const btn = new BaseBtn(
      this.scene,
      this.scene.btnContainer.x,
      this.scene.cameras.main.height - 140
    );
    btn.container.setScale(0.8);
    this.openBtnTexture = this.scene.add
      .image(0, 0, "portalMask")
      .setTintFill(0x000000)
      .setScale(1.4);
    btn.container.add(this.openBtnTexture);
    btn.setInteractive(this.showEditor.bind(this));
    btn.setHotkey("P", "P");
    this.openBtn = btn;
  }

  showEditor() {
    this.container.setVisible(!this.container.visible);
    if (this.container.visible) {
       this.openBtnTexture.setTintFill(0xffffff);
      this.openBtn.btnImage.setTintFill(0x000000);
    } else {
      this.openBtnTexture.setTintFill(0x000000);
      this.openBtn.btnImage.clearTint();
    }
  }
  private renderBoard() {
    const container = this.scene.add.container(
      this.scene.grid.container.x,
      this.scene.grid.container.y
    );
    const rows = this.board.length;
    const columns = this.board[0].length;

    const config = this.scene.cache.json.get("config") as GameConfig;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const tile = this.scene.add
          .rectangle(
            j * (this.tileSize + config.game.gridOptions.gap),
            i * (this.tileSize + config.game.gridOptions.gap),
            this.tileSize,
            this.tileSize,
            0xaaaaaa
          )
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .setBlendMode(BlendModes.MULTIPLY);
        container.add(tile);
        tile.on("pointerover", () => tile.setFillStyle(0xcccccc));
        tile.on("pointerout", () => tile.setFillStyle(0xaaaaaa));
        tile.on("pointerdown", () => this.handleTileClick(i, j));
      }
    }
    this.container = container;
  }

  private handleTileClick(x: number, y: number) {
    const pos: Position = [x, y];

    if (this.board[x][y].color === -1) return;

    if (this.tryRemoveExistingPortal(pos)) return;

    this.selectPosition(pos);

    if (this.selected.length === 2) {
      this.createPortalFromSelection();
    }
  }

  private tryRemoveExistingPortal(pos: Position): boolean {
    const index = this.findPortalIndexWithCell(pos);
    if (index !== -1) {
      this.removePortalAt(index);
      console.log(`Removed portal with cell: [${pos[0]}, ${pos[1]}]`);
      return true;
    }
    return false;
  }

  private selectPosition(pos: Position): void {
    this.selected.push(pos);
  }

  private createPortalFromSelection(): void {
    const [from, to] = this.selected;
    const pair: [Position, Position] = [from, to];
    this.portals.push({ pair });
    this.linkCellsBidirectionally(from, to);
    this.selected = [];
  }

  private linkCellsBidirectionally(a: Position, b: Position): void {
    this.board[a[0]][a[1]].setLinkedCell(this.board[b[0]][b[1]]);
    this.board[b[0]][b[1]].setLinkedCell(this.board[a[0]][a[1]]);
  }

  private findPortalIndexWithCell(pos: Position): number {
    return this.portals.findIndex(({ pair }) =>
      pair.some((p) => p[0] === pos[0] && p[1] === pos[1])
    );
  }

  private removePortalAt(index: number) {
    const pos = this.portals.splice(index, 1);
    if (pos.length < 1) return;
    const {
      pair: [a, b],
    } = pos[0];
    this.board[a[0]][a[1]].unlink();
    this.board[b[0]][b[1]].unlink();
    this.selected = [];
  }

  getPortals(): Portal[] {
    return this.portals;
  }

  clearPortals() {
    this.portals = [];
    this.selected = [];
    debugger;
  }
}
