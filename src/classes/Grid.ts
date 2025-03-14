import Cell from "./Cell";
import { Game } from "../scenes/Game";
import {
  ColorType,
  GameConfig,
  GameMode,
  GameStatus,
  GridOptions,
  Vector2,
} from "../types";
import { dirs } from "../utils";

export default class Grid {
  scene: Game;
  container: Phaser.GameObjects.Container;
  transitionSpeed = 800;
  transitionSpeedMinimum = 50;
  pendingCalls = 0;
  board: Cell[][] = [];
  cellSize: number;
  defaultValues: number[][];
  history: [];
  border: Phaser.GameObjects.NineSlice;

  constructor(scene: Game, levelData: number[][]) {
    this.scene = scene;
    this.defaultValues = levelData;
    const rows = levelData.length;
    const columns = levelData[0].length;
    const tiles = [];

    const { gridOptions }: { gridOptions: GridOptions } =
      scene.cache.json.get("config")["game"];

    this.transitionSpeed = gridOptions.transition.default;
    this.transitionSpeedMinimum = gridOptions.transition.minimum;

    const cellSize = Math.min(
      (gridOptions.height - gridOptions.gap * (rows - 1)) / rows,
      (gridOptions.width - gridOptions.gap * (columns - 1)) / columns
    );

    this.cellSize = cellSize;

    const correctionX =
      gridOptions.width -
      gridOptions.borderPadding -
      columns * (cellSize + gridOptions.gap);

    const correctionY =
      gridOptions.height -
      gridOptions.borderPadding -
      rows * (cellSize + gridOptions.gap);

    this.border = scene.add
      .nineslice(
        gridOptions.borderOffset.left,
        gridOptions.borderOffset.top,
        "grid_border",
        undefined,
        gridOptions.width - gridOptions.borderOffset.right - correctionX,
        gridOptions.height - gridOptions.borderOffset.bottom - correctionY,
        270,
        128,
        gridOptions.height / 2.56,
        gridOptions.height / 3
      )
      .setOrigin(0, 0)
      .setTint(this.getColor());

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        this.scene.gameStates.availableColors.add(levelData[i][j]);
        const newCell = new Cell(this, i, j, levelData[i][j], gridOptions.gap);
        tiles.push(newCell.tile);
        tiles.push(newCell.transitionTile);

        this.board[i] ??= [];
        this.board[i][j] = newCell;

        if (levelData[i][j] !== this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains++;
          this.scene.gameStates.initialState.remains++;
        }
      }
    }
    this.container = this.scene.add.container(
      this.scene.cameras.main.width / 2 -
        gridOptions.width / 2 -
        gridOptions.offset.x,
      gridOptions.offset.y,
      [this.border, ...tiles]
    );
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

    const { colors } = this.scene.cache.json.get("config") as GameConfig;

    this.pendingCalls++;
    const cell = this.board[x][y];
    const currentTile = this.board[x][y].tile;

    seen.add(cell);

    const animate = cell.transitionTile;

    const minDelay = this.transitionSpeedMinimum;
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
          colors[newColor].value
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
        this.board[x][y].tile.setUniform("color.value", colors[newColor].value);

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
  private flip(x: number, y: number, colorToChange: ColorType) {
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
  cellAction(x: number, y: number, colorToChange: ColorType) {
    if (this.scene.gameStates.mode == GameMode.Play) {
      if (this.scene.gameStates.state === GameStatus.Waiting) return;
      this.flip(x, y, colorToChange);
    } else this.changeColor(x, y);
  }
  private changeColor(x: number, y: number) {
    const { colors } = this.scene.cache.json.get("config") as GameConfig;

    this.board[x][y].tile.setUniform(
      "color.value",
      colors[this.scene.gameStates.selectedColor].value
    );
    this.board[x][y].color = Number(this.scene.gameStates.selectedColor);
  }
  private getColor() {
    const { colors } = this.scene.cache.json.get("config") as GameConfig;
    const { x, y, z } = colors[this.scene.gameStates.targetColor].value;
    return Phaser.Display.Color.GetColor(x * 255, y * 255, z * 255);
  }
  updateBorderTint() {
    this.border.clearTint();
    this.border.setTint(this.getColor());
  }
  resetBoard() {
    const data = this.defaultValues;
    const rows = data.length;
    const columns = data[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        this.board[i][j].setColor(data[i][j]);
      }
    }
  }
}
