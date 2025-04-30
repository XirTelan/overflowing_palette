import Cell from "./Cell";
import { Game } from "../scenes/Game";
import {
  ColorType,
  GameConfig,
  GameMode,
  GameStatus,
  Tools,
  Vector2,
} from "../types";
import { DIRECTIONS } from "../utils";
import { SwapSelection } from "./Game/SwapSelection";
import SimpleCell from "./SimpleCell";
import ShaderCell from "./ShaderCell";

export default class Grid {
  scene: Game;
  container: Phaser.GameObjects.Container;

  activeSwap?: SwapSelection;

  isPerformanceMode: boolean = false;

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

    const {
      game: { gridOptions },
      gameplay,
    } = scene.cache.json.get("config") as GameConfig;

    this.transitionSpeed = gameplay.transitionDefault;
    this.transitionSpeedMinimum = gameplay.transitionMinimum;
    this.isPerformanceMode = gameplay.performanceMode;

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
        let newCell: Cell;
        if (this.isPerformanceMode) {
          newCell = new SimpleCell(
            this.scene,
            i,
            j,
            levelData[i][j],
            gridOptions.gap,
            cellSize,
            this.cellAction.bind(this)
          );
        } else {
          newCell = new ShaderCell(
            this.scene,
            i,
            j,
            levelData[i][j],
            gridOptions.gap,
            cellSize,
            this.cellAction.bind(this)
          );
        }

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

    this.pendingCalls++;
    const currentCell = this.board[x][y];

    seen.add(currentCell);

    const animationDelay = Math.max(
      this.transitionSpeed * Math.pow(0.8, level),
      this.transitionSpeedMinimum
    );

    this.startTransitionAnimation(
      startPoint,
      currentCell,
      level,
      newColor,
      animationDelay
    );

    for (const [dx, dy] of DIRECTIONS) {
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
    const { mode, state, selectedTool } = this.scene.gameStates;

    if (mode == GameMode.Editor) {
      this.board[x][y].setColor(colorToChange);
      return;
    }
    if (state === GameStatus.Waiting && this.activeSwap) {
      this.activeSwap.cancelSwapSelection();
      this.activeSwap = undefined;
    }
    if (state === GameStatus.Waiting) return;

    if (selectedTool !== Tools.none) {
      this.swapSelection(x, y);
      return;
    }
    this.flip(x, y, colorToChange);
  }

  swapSelection(x: number, y: number) {
    this.activeSwap = new SwapSelection(this.scene, this, x, y);
  }

  removeSwapSelection() {
    this.activeSwap = undefined;
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

  startTransitionAnimation(
    startPoint: Vector2,
    currentCell: Cell,
    level: number,
    newColor: ColorType,
    animationDelay: number
  ) {
    const transitionTile = currentCell.transitionTile;
    const defaultScale = transitionTile.scale;

    this.scene.tweens.chain({
      targets: null,
      tweens: [
        {
          targets: currentCell.tile,
          x: {
            value: () => currentCell.tile.x + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          y: {
            value: () => currentCell.tile.y + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          onComplete: () => {
            transitionTile.setVisible(true).setDepth(10);
          },
          repeat: 0,
          yoyo: true,
          ease: "Sine.easeInOut",
        },
        {
          targets: transitionTile,
          alpha: 1,
          duration: animationDelay / 2 - 10,
          repeat: 0,
          scale: defaultScale + defaultScale * 0.2,
          ease: "Linear",
        },
        {
          targets: transitionTile,
          alpha: 0,
          scale: defaultScale + defaultScale * 0.4,
          duration: animationDelay / 2 - 10,
          repeat: 0,
          ease: "Linear",
        },
      ],
      onComplete: () => {
        transitionTile.setVisible(false);
        transitionTile.alpha = 1;
        transitionTile.scale = defaultScale;
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
          detune: Math.min(50 * level, 600),
          volume: level ? Math.min(0.4, 1 - 0.9 + level * 0.1) : 1,
        });
        currentCell.transitionStart(newColor, startPoint);
      },
      onUpdate: (tween) => {
        currentCell.transitionUpdate(tween.getValue());
      },
      onComplete: () => {
        currentCell.transitionEnd();

        if (currentCell.color === this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains++;
        }

        currentCell.color = Number(newColor);

        if (currentCell.color === this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains -= 1;
        }
        this.pendingCalls--;
        if (this.pendingCalls === 0) {
          this.scene.changeGameState(GameStatus.Active);
        }
      },
    });
  }
}
