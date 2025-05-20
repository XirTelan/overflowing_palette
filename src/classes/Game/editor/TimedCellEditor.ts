import { Game } from "@/scenes/Game";
import { EditorManager } from "./EditorManager";
import {  Position, TimedCell } from "@/types";
import { BaseCellEditor } from "./BaseCellEditor";

export class TimedCellEditor extends BaseCellEditor {
  timedCells: TimedCell[];
  turnsCount: number = 1;

  constructor(scene: Game, manager: EditorManager) {
    super(scene, manager);
    this.timedCells = scene.grid.timedCells ?? [];
    this.createTurnAndColorUI();
  }

  private createTurnAndColorUI() {
    const html = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <input type="number" class="card timed-cell-turn" id="turnsCount" value="1" min="1"/>
      </div>
    `;

    const uiElement = this.scene.add.dom(850, -60).createFromHTML(html);

    const turnsInput = uiElement.getChildByID("turnsCount") as HTMLInputElement;

    turnsInput.addEventListener("input", (e) => {
      this.turnsCount = parseInt((e.target as HTMLInputElement).value);
    });

    this.container.add(uiElement);
  }

  protected handleTileClick(x: number, y: number): void {
    const pos: Position = [x, y];
    const cell = this.board[x][y];

    if (cell.isTimed()) {
      this.removeTimedCell(pos);
      return;
    }
    if (!this.manager.isCellAvailable(pos)) return;

    cell.setTimedCell(this.turnsCount, this.scene.gameStates.selectedColor);
    this.timedCells.push({
      pos,
      turns: this.turnsCount,
      color: this.scene.gameStates.selectedColor,
    });
  }

  private removeTimedCell(pos: Position): void {
    const i = this.timedCells.findIndex(
      (c) => c.pos[0] === pos[0] && c.pos[1] === pos[1]
    );
    if (i === -1) return;

    this.board[pos[0]][pos[1]].clearTimed?.();
    this.timedCells.splice(i, 1);
  }

  isCellAvailable(x: number, y: number) {
    return this.board[x][y].isTimed();
  }

  clearTimedCells(): void {
    for (const { pos } of this.timedCells) {
      this.board[pos[0]][pos[1]].clearTimed?.();
    }
    this.timedCells = [];
  }

  getValues() {
    return this.timedCells;
  }
}
