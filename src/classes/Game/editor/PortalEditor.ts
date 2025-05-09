import { Game } from "@/scenes/Game";
import { EditorManager } from "./EditorManager";
import { BaseCellEditor } from "./BaseCellEditor";
import { Portal, Position } from "@/types";

export class PortalEditor extends BaseCellEditor {
  portals: Portal[] = [];
  selected: Position[] = [];
  selectionUI?: Phaser.GameObjects.DOMElement;

  constructor(scene: Game, manager: EditorManager) {
    super(scene, manager);
    this.portals = scene.grid.portals ?? [];
  }

  protected handleTileClick(x: number, y: number) {
    const pos: Position = [x, y];
    if (this.tryRemoveExistingPortal(pos)) return;
    if (!this.manager.isCellAvailable(pos)) return;

    if (
      this.selected.length === 1 &&
      pos[0] === this.selected[0][0] &&
      pos[1] === this.selected[0][1]
    ) {
      return;
    }
    this.selected.push(pos);

    if (this.selected.length === 2) {
      this.createPortalFromSelection();
    }
  }

  private tryRemoveExistingPortal(pos: Position): boolean {
    const index = this.portals.findIndex(({ pair }) =>
      pair.some((p) => p[0] === pos[0] && p[1] === pos[1])
    );
    if (index !== -1) {
      const [removed] = this.portals.splice(index, 1);
      this.unlink(removed.pair[0], removed.pair[1]);
      this.selected = [];
      return true;
    }
    return false;
  }

  private createPortalFromSelection(): void {
    const [from, to] = this.selected;
    this.portals.push({ pair: [from, to] });
    this.link(from, to);
    this.selected = [];
  }

  private link(a: Position, b: Position) {
    this.board[a[0]][a[1]].setLinkedCell(this.board[b[0]][b[1]]);
    this.board[b[0]][b[1]].setLinkedCell(this.board[a[0]][a[1]]);
  }

  private unlink(a: Position, b: Position) {
    this.board[a[0]][a[1]].unlink();
    this.board[b[0]][b[1]].unlink();
  }

  isCellAvailable(x: number, y: number) {
    return this.board[x][y].isLinked();
  }

  clearPortals() {
    for (const {
      pair: [a, b],
    } of this.portals) {
      this.unlink(a, b);
    }
    this.portals = [];
    this.selected = [];
  }
  getValues() {
    return this.portals;
  }
}
