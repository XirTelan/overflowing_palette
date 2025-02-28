import Cell from "./Cell";
import { Game } from "./scenes/Game";
import { ColorType, GameStatus } from "./types";
import { colors, dirs } from "./utils";

export default class Grid {
  scene: Game;
  transitionSpeed = 800;
  pendingCalls = 0;
  cellSize = 72;
  board: Cell[][] = [];

  constructor(scene: Game, levelData: number[][]) {
    this.scene = scene;

    const rows = levelData.length;
    const columns = levelData[0].length;
    const tiles = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const newCell = new Cell(this, i, j, levelData[i][j], 5, this.cellSize);
        tiles.push(newCell.tile);

        this.board[i] ??= [];
        this.board[i][j] = newCell;

        if (levelData[i][j] !== this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains++;
        }
      }
    }
    this.scene.add.container(105, 105, tiles);
  }

  private bfs(
    x: number,
    y: number,
    colorToChange: ColorType,
    newColor: ColorType,
    seen: Set<Cell>,
    level: number
  ) {
    if (
      !this.board[x] ||
      !this.board[x][y] ||
      this.board[x][y].color == newColor ||
      this.board[x][y].color != colorToChange ||
      seen.has(this.board[x][y])
    )
      return;

    this.pendingCalls++;
    const currentTile = this.board[x][y].tile;
    const test = this.board[x][y].tile.getCenter(undefined, true);
    seen.add(this.board[x][y]);
    const animate = this.scene.add.shader(
      "base",
      test.x,
      test.y,
      this.cellSize,
      this.cellSize
    );
    animate.setUniform("color.value", { x: 0.949, y: 0.953, z: 0.827 });
    animate.setUniform("active.value", 1.0);
    animate.setUniform("transparent.value", 1.0);

    const speedUpFactor = level * 5;

    this.scene.tweens.chain({
      targets: null,
      tweens: [
        {
          targets: currentTile,
          x: {
            value: () => currentTile.x + Phaser.Math.Between(-5, 5),
            duration: Math.max(0, 25 - speedUpFactor),
            repeat: 1,
          },
          y: {
            value: () => currentTile.y + Phaser.Math.Between(-5, 5),
            duration: Math.max(0, 25 - speedUpFactor),
            repeat: 1,
          },
          repeat: 0,
          yoyo: true,
          ease: "Sine.easeInOut",
        },
        {
          targets: animate,
          alpha: 0.8,
          duration: Math.max(0, this.transitionSpeed / 2 - speedUpFactor * 2),
          repeat: 0,
          scale: 1.2,
          ease: "Linear",
        },
        {
          targets: animate,
          alpha: 0,
          scale: 1.4,
          duration: this.transitionSpeed / 2 - 50 - speedUpFactor * 2,
          repeat: 0,

          ease: "Linear",
        },
      ],
      delay: 0,
      loop: 0,
    });

    const animationDelay =
      this.transitionSpeed - speedUpFactor * this.transitionSpeed * 0.05;

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      delay: 50 - speedUpFactor,
      duration: animationDelay,
      ease: "Cubic.InOut",
      repeat: 0,
      onStart: () => {
        this.board[x][y].tile.setUniform(
          "colorToTransform.value",
          colors[newColor]
        );
      },
      onUpdate: (tween) => {
        this.board[x][y].tile.setUniform("transition.value", tween.getValue());
      },
      onComplete: () => {
        this.board[x][y].tile.scale = 1;
        this.board[x][y].tile.depth = 1;
        this.board[x][y].tile.setUniform("transition.value", 0.0);
        this.board[x][y].tile.setUniform("color.value", colors[newColor]);

        if (this.board[x][y].color === this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains++;
        }

        this.board[x][y].color = Number(newColor);

        if (this.board[x][y].color === this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains -= 1;
        }
        this.pendingCalls--;
        if (this.pendingCalls === 0) {
          console.log("yep");
          this.scene.changeGameState(GameStatus.Active);
        }
        animate.destroy();
      },
    });

    for (const [dx, dy] of dirs) {
      this.scene.time.delayedCall(animationDelay, () => {
        this.bfs(x + dx, y + dy, colorToChange, newColor, seen, level + 1);
      });
    }
  }
  flip(x: number, y: number, colorToChange: ColorType) {
    if (colorToChange == this.scene.gameStates.selectedColor) return;

    this.scene.changeGameState(GameStatus.Waiting);

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
