import { Game } from "../../scenes/Game";
import { GameStatus, Tools } from "../../types";
import { DIRECTIONS } from "../../utils";
import Cell from "../Cell";
import Grid from "../Grid";

const SWAP_DURATION = 50;

export class SwapSelection {
  scene: Game;
  grid: Grid;
  keyObj: Phaser.Input.Keyboard.Key | undefined;

  activeCells: Phaser.GameObjects.GameObject[];

  originPos;
  cell: Cell;
  activeTween: Phaser.Tweens.Tween;

  constructor(scene: Game, grid: Grid, x: number, y: number) {
    this.scene = scene;
    this.grid = grid;

    this.scene.setGameState(GameStatus.Waiting);
    const selectedTool = this.scene.gameStates.selectedTool;
    this.cell = grid.board[x][y];
    const { tile, color } = this.cell;
    this.originPos = [tile.x, tile.y];

    let dirs = DIRECTIONS;
    switch (selectedTool) {
      case Tools.Horizontal:
        dirs = [DIRECTIONS[0], DIRECTIONS[1]];
        break;
      case Tools.Vertical:
        dirs = [DIRECTIONS[2], DIRECTIONS[3]];
        break;
    }

    this.activeCells = [];
    dirs.forEach((dir) => {
      const [dx, dy] = [x + dir[0], y + dir[1]];
      const rows = this.grid.board.length - 1;
      const columns = this.grid.board[0].length - 1;
      if (dx < 0 || dy < 0 || dx > rows || dy > columns) return;
      const cell = grid.board[dx][dy];
      if (cell.color === color || cell.color === -1) return;
      this.activeCells.push(this.createSwapPos(dx, dy));
    });

    if (this.activeCells.length === 0) {
      this.scene.setGameState(GameStatus.Active);
      return;
    }

    this.activeTween = this.scene.tweens.add({
      targets: tile,
      x: {
        value: () => tile.x + Phaser.Math.Between(-3, 3),
        duration: 150,
      },
      y: {
        value: () => tile.y + Phaser.Math.Between(-3, 3),
        duration: 150,
      },
      yoyo: true,
      repeat: -1,
    });

    this.keyObj = this.scene.input.keyboard?.addKey("ESC");
    if (this.keyObj)
      this.keyObj.on("down", () => {
        this.cancelSwapSelection();
      });
  }

  cancelSwapSelection() {
    this.scene.changeSelectedTool(Tools.none);
    this.activeCells.forEach((obj) => obj.destroy());
    this.keyObj?.destroy();
    this.scene.setGameState(GameStatus.Active);
    this.activeTween?.destroy();
    this.cell.tile.setPosition(this.originPos[0], this.originPos[1]);
    this.grid.removeSwapSelection();
  }

  createSwapPos(x: number, y: number) {
    const dd = this.grid.board[x][y].tile.getWorldPoint();

    const transitionTile = this.scene.add
      .shader(
        "base",
        dd.x + this.grid.cellSize / 2,
        dd.y + this.grid.cellSize / 2,
        this.grid.cellSize,
        this.grid.cellSize
      )
      .setScale(1.2);
    transitionTile.setUniform("color.value", { x: 0.949, y: 0.953, z: 0.827 });
    transitionTile.setUniform("active.value", 1.0);
    transitionTile.setUniform("transparent.value", 1.0);
    transitionTile.setInteractive();
    transitionTile.on("pointerup", () => {
      this.applySwap(x, y);
    });

    return transitionTile;
  }
  applySwap(x: number, y: number) {
    const swapCell = this.grid.board[x][y];
    const { x: swapX, y: swapY } = swapCell.tile.getWorldPoint();
    const { x: cellX, y: cellY } = this.cell.tile.getWorldPoint();

    const [dx, dy] = [swapX - cellX, swapY - cellY];
    const usedTool = this.scene.gameStates.selectedTool;
    this.cancelSwapSelection();

    this.scene.time.delayedCall(SWAP_DURATION, () => {
      const temp = swapCell.color;
      swapCell.setColor(this.cell.color);
      this.cell.setColor(temp);
      this.scene.useTool(usedTool);
    });
    this.scene.tweens.add({
      targets: swapCell.tile,
      x: `-=${dx / 2}`,
      y: `-=${dy / 2}`,
      yoyo: true,
      duration: SWAP_DURATION,
    });
    this.scene.tweens.add({
      targets: this.cell.tile,
      x: `+=${dx / 2}`,
      y: `+=${dy / 2}`,
      yoyo: true,
      duration: SWAP_DURATION,
    });
  }
}
