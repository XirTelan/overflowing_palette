import Cell from "./Cell";
import { Game } from "./scenes/Game";
import { ColorType } from "./types";
import { colors, dirs } from "./utils";

export default class Grid {
  scene: Game;

  board: Cell[][] = [];

  constructor(scene: Game, levelData: number[][]) {
    this.scene = scene;

    const rows = levelData.length;
    const columns = levelData[0].length;
    const tiles = [];
    for (let i = 0; i < rows; i++) {
      console.log("row", levelData[i]);
      for (let j = 0; j < columns; j++) {
        const newCell = new Cell(this, i, j, levelData[i][j], 5, 70);
        tiles.push(newCell.tile);

        this.board[i] ??= [];
        this.board[i][j] = newCell;

        if (levelData[i][j] !== this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains++;
        }
      }
    }
    this.scene.add.container(115, 100, tiles);
  }

  bfs(
    x: number,
    y: number,
    colorToChange: ColorType,
    newColor: ColorType,
    seen: Set<Cell>,
    level: number
  ) {
    console.log("bfs pre", colorToChange, newColor);
    if (
      !this.board[x] ||
      !this.board[x][y] ||
      this.board[x][y].color == newColor ||
      this.board[x][y].color != colorToChange ||
      seen.has(this.board[x][y])
    )
      return;

    console.log("bfs", colorToChange, this.board[x][y].color);

    this.board[x][y].tile.setUniform("color.value", colors[newColor]);
    this.board[x][y].color = newColor;

    if (this.board[x][y].color === this.scene.gameStates.targetColor) {
      this.scene.gameStates.remains -= 1;
      console.log(this.scene.gameStates.remains);
    }

    seen.add(this.board[x][y]);

    for (const [dx, dy] of dirs) {
      this.scene.time.delayedCall(
        200,
        this.bfs,
        [x + dx, y + dy, colorToChange, newColor, seen, level + 1],
        this
      );
    }
  }
  flip(x, y, colorToChange) {
    if (colorToChange == this.scene.gameStates.selectedColor) return;

    console.log(
      "flip",
      x,
      y,
      colorToChange,
      this.scene.gameStates.selectedColor
    );
    this.bfs(
      x,
      y,
      colorToChange,
      this.scene.gameStates.selectedColor,
      new Set(),
      0
    );
  }
}
