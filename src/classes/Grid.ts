import Cell from "./Cell";
import { Game } from "../scenes/Game";
import { ColorType, GameStatus, Vector2, Vector3 } from "../types";
import { colors, dirs } from "../utils";

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
        tiles.push(newCell.transitionTile);

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
    level: number,
    startPoint: Vector2
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
    const cell = this.board[x][y];
    const currentTile = this.board[x][y].tile;

    seen.add(cell);

    const animate = cell.transitionTile;

    const minDelay = 50; // Prevents animation from getting too fast
    const animationDelay = Math.max(
      this.transitionSpeed * Math.pow(0.8, level),
      minDelay
    );

    this.scene.tweens.chain({
      targets: null,
      tweens: [
        {
          targets: currentTile,
          x: {
            value: () => currentTile.x + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          y: {
            value: () => currentTile.y + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          onComplete: () => {
            animate.setVisible(true).setDepth(10);
          },
          repeat: 0,
          yoyo: true,
          ease: "Sine.easeInOut",
        },
        {
          targets: animate,
          alpha: 0.8,
          duration: animationDelay / 2 - 10,
          repeat: 0,
          scale: 1.2,
          ease: "Linear",
        },
        {
          targets: animate,
          alpha: 0,
          scale: 1.4,
          duration: animationDelay / 2 - 10,
          repeat: 0,
          ease: "Linear",
        },
      ],
      onComplete: () => {
        animate.setVisible(false);
        animate.scale = 1;
      },
      delay: 0,
      loop: 0,
    });

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      delay: animationDelay * 0.1,
      duration: animationDelay,
      ease: "Cubic.InOut",
      repeat: 0,
      onStart: () => {
        this.scene.sound.play("tileFlip", {
          detune: 150 * level,
        });
        this.board[x][y].tile.setUniform(
          "colorToTransform.value",
          colors[newColor]
        );
        this.board[x][y].tile.setUniform("curPoint.value", { x, y });
        this.board[x][y].tile.setUniform("startPoint.value", startPoint);
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
          this.scene.changeGameState(GameStatus.Active);
        }
      },
    });

    for (const [dx, dy] of dirs) {
      this.scene.time.delayedCall(animationDelay, () => {
        this.bfs(
          x + dx,
          y + dy,
          colorToChange,
          newColor,
          seen,
          level + 1,
          startPoint
        );
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
      0,
      { x, y }
    );
  }
}
