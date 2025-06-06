import Cell from "./Cell";
import { Game } from "../scenes/Game";
import {
  ColorType,
  GameConfig,
  GameMode,
  GameStatus,
  LevelData,
  TimedCell,
  Tools,
  Vector2,
} from "../types";
import { DIRECTIONS, getConfig } from "../utils";
import { SwapSelection } from "./Game/SwapSelection";
import SimpleCell from "./SimpleCell";
import ShaderCell from "./ShaderCell";
import { BlockedCell } from "./BlockedCell";
import { AudioManager } from "./common/AudioManager";

export default class Grid {
  scene: Game;
  container: Phaser.GameObjects.Container;
  activeSwap?: SwapSelection;

  isPerformanceMode = false;
  transitionSpeed = 800;
  transitionSpeedMinimum = 50;

  pendingCalls = 0;
  board: Cell[][] = [];
  cellSize: number;
  defaultValues: number[][];
  portals: LevelData["portals"];
  timedCells: LevelData["timed"];

  timedCellsQueue: TimedCell[];

  history: { x: number; y: number; color: ColorType }[] = [];
  border: Phaser.GameObjects.NineSlice;

  private gridOptions: GameConfig["game"]["gridOptions"];

  constructor(scene: Game, levelData: LevelData) {
    this.scene = scene;
    this.defaultValues = levelData.board;
    this.portals = levelData.portals;
    this.timedCells = levelData.timed;

    const config = getConfig(scene);
    this.gridOptions = config.game.gridOptions;

    this.loadConfig();
    this.calculateCellSize();
    this.createBorder();
    this.createBoard(levelData);
    this.setupTimedCells(levelData.timed);
    this.createContainer();
  }

  private loadConfig() {
    const {
      game: { gridOptions },
      gameplay,
    } = getConfig(this.scene);

    this.gridOptions = gridOptions;
    this.transitionSpeed = gameplay.transitionDefault;
    this.transitionSpeedMinimum = gameplay.transitionMinimum;
    this.isPerformanceMode = gameplay.performanceMode;
  }

  private calculateCellSize() {
    const { height, width, gap } = this.gridOptions;
    const rows = this.defaultValues.length;
    const columns = this.defaultValues[0].length;

    this.cellSize = Math.min(
      (height - gap * (rows - 1)) / rows,
      (width - gap * (columns - 1)) / columns
    );
  }

  private createBorder() {
    const rows = this.defaultValues.length;
    const columns = this.defaultValues[0].length;

    const { height, width, gap, borderPadding, borderOffset } =
      this.gridOptions;

    const correctionX = width - borderPadding - columns * (this.cellSize + gap);

    const correctionY = height - borderPadding - rows * (this.cellSize + gap);

    this.border = this.scene.add
      .nineslice(
        borderOffset.left,
        borderOffset.top,
        "grid_border",
        undefined,
        width - borderOffset.right - correctionX,
        height - borderOffset.bottom - correctionY,
        270,
        128,
        height / 2.56,
        height / 3
      )
      .setOrigin(0, 0)
      .setTint(this.getColor());
  }

  private createBoard(levelData: LevelData) {
    const { board, portals } = levelData;
    const rows = board.length;
    const columns = board[0].length;
    const { gap } = this.gridOptions;
    this.scene.gameStates.remains = rows * columns;
    this.scene.gameStates.initialState.remains = rows * columns;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const value = board[i][j];
        this.scene.gameStates.availableColors.add(value);

        const cell = this.createCell(i, j, value, gap);
        this.board[i] ??= [];
        this.board[i][j] = cell;

        if (value == -1 || value === this.scene.gameStates.targetColor) {
          this.scene.gameStates.remains--;
          this.scene.gameStates.initialState.remains--;
        }
      }
    }

    for (const { pair } of portals ?? []) {
      const [[x1, y1], [x2, y2]] = pair;
      const cellA = this.board[x1][y1];
      const cellB = this.board[x2][y2];

      const color = Math.floor(Math.random() * 0xffffff);

      if (cellA && cellB) {
        cellA.setLinkedCell(cellB, color);
        cellB.setLinkedCell(cellA, color);
      }
    }
  }

  private setupTimedCells(timed: LevelData["timed"]) {
    this.timedCellsQueue = [];
    timed?.sort((a, b) => b.turns - a.turns);

    const { initialState, mode } = this.scene.gameStates;

    for (const { pos, turns, color } of timed ?? []) {
      const cell = this.board[pos[0]][pos[1]];
      cell.setTimedCell(turns, color);
      this.timedCellsQueue.push({
        pos,
        color,
        turns:
          mode === GameMode.Endless
            ? initialState.turns + turns
            : initialState.turns - turns,
      });
    }
  }

  private createCell(i: number, j: number, value: number, gap: number): Cell {
    const args = [
      this.scene,
      i,
      j,
      value,
      gap,
      this.cellSize,
      this.cellAction.bind(this),
    ] as const;

    if (value === -1) return new BlockedCell(...args);
    if (this.isPerformanceMode) return new SimpleCell(...args);
    return new ShaderCell(...args);
  }

  private createContainer() {
    const { width, offset } = this.gridOptions;
    const tiles = this.board.flat().map((cell) => cell.container);

    this.container = this.scene.add.container(
      this.scene.cameras.main.width / 2 - width / 2 - offset.x,
      offset.y,
      [this.border, ...tiles]
    );
  }

  private shouldSkipCell(
    x: number,
    y: number,
    colorToChange: ColorType,
    newColor: ColorType,
    seen: Set<Cell>
  ): boolean {
    const cell = this.board[x]?.[y];
    return (
      !cell ||
      cell.color === newColor ||
      cell.color !== colorToChange ||
      seen.has(cell)
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
    if (this.shouldSkipCell(x, y, colorToChange, newColor, seen)) return;

    const currentCell = this.board[x][y];
    seen.add(currentCell);
    this.pendingCalls++;

    const delay = Math.max(
      this.transitionSpeed * Math.pow(0.8, level),
      this.transitionSpeedMinimum
    );

    this.startTransitionAnimation(
      startPoint,
      currentCell,
      level,
      newColor,
      delay
    );

    for (const [dx, dy] of DIRECTIONS) {
      this.scene.time.delayedCall(delay, () => {
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
    if (currentCell.linkendCell && !seen.has(currentCell.linkendCell)) {
      this.scene.time.delayedCall(delay, () => {
        this.bfs(
          currentCell.linkendCell!.pos.x,
          currentCell.linkendCell!.pos.y,
          colorToChange,
          newColor,
          seen,
          level + 1,
          startPoint
        );
      });
    }
  }

  private flip(
    x: number,
    y: number,
    colorToChange: ColorType,
    newColor = this.scene.gameStates.selectedColor
  ) {
    this.scene.changeGameState(GameStatus.Waiting);
    this.bfs(x, y, colorToChange, newColor, new Set(), 0, { x, y });
  }

  cellAction(x: number, y: number) {
    const { mode, state, selectedTool } = this.scene.gameStates;
    const currentCell = this.board[x][y];
    if (mode === GameMode.Editor) {
      const colorToChange = this.scene.gameStates.selectedColor;
      const { gap } = this.gridOptions;
      if (colorToChange === -1) {
        currentCell.container.destroy();
        this.board[x][y] = this.createCell(x, y, -1, gap);
        this.container.add(this.board[x][y].container);
        return;
      }
      if (currentCell.color === -1) {
        currentCell.container.destroy();
        this.board[x][y] = this.createCell(x, y, colorToChange, gap);
        this.container.add(this.board[x][y].container);
        return;
      }
      this.board[x][y].setColor(colorToChange);
      return;
    }

    if (state === GameStatus.Waiting) {
      if (this.activeSwap) {
        this.activeSwap.cancelSwapSelection();
        this.activeSwap = undefined;
      }
      return;
    }

    if (selectedTool !== Tools.none) {
      this.swapSelection(x, y);
      return;
    }

    if (
      currentCell.color === -1 ||
      currentCell.color === this.scene.gameStates.selectedColor
    )
      return;

    this.flip(x, y, currentCell.color);
  }

  swapSelection(x: number, y: number) {
    this.activeSwap = new SwapSelection(this.scene, this, x, y);
  }

  removeSwapSelection() {
    this.activeSwap = undefined;
  }

  private getColor() {
    const { colors } = getConfig(this.scene);
    const { x, y, z } = colors[this.scene.gameStates.targetColor].value;
    return Phaser.Display.Color.GetColor(x * 255, y * 255, z * 255);
  }

  updateBorderTint() {
    this.border.clearTint();
    this.border.setTint(this.getColor());
  }

  resetBoard() {
    for (let i = 0; i < this.defaultValues.length; i++) {
      for (let j = 0; j < this.defaultValues[0].length; j++) {
        this.board[i][j].setColor(this.defaultValues[i][j]);
      }
    }
    this.setupTimedCells(this.timedCells);
  }

  startTransitionAnimation(
    startPoint: Vector2,
    currentCell: Cell,
    level: number,
    newColor: ColorType,
    animationDelay: number
  ) {
    const tile = currentCell.tile;
    const startColor = currentCell.color;

    const transitionTile = currentCell.transitionTile;
    const defaultScale = transitionTile.scale;

    this.scene.tweens.chain({
      targets: null,
      tweens: [
        {
          targets: tile,
          x: {
            value: () => tile.x + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          y: {
            value: () => tile.y + Phaser.Math.Between(-5, 5),
            duration: animationDelay * 0.1,
            repeat: 1,
          },
          onComplete: () => transitionTile.setVisible(true).setDepth(10),
          yoyo: true,
          ease: "Sine.easeInOut",
        },
        {
          targets: transitionTile,
          alpha: 1,
          scale: defaultScale + defaultScale * 0.2,
          duration: animationDelay / 2 - 10,
          ease: "Linear",
        },
        {
          targets: transitionTile,
          alpha: 0,
          scale: defaultScale + defaultScale * 0.4,
          duration: animationDelay / 2 - 10,
          ease: "Linear",
        },
      ],
      onComplete: () => {
        transitionTile.setVisible(false);
        transitionTile.alpha = 1;
        transitionTile.scale = defaultScale;
      },
    });

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      delay: animationDelay * 0.5,
      duration: animationDelay,
      ease: "Cubic.InOut",
      onStart: () => {
        AudioManager.getInstance().playSFX(this.scene, "tileFlip", {
          detune: Math.min(50 * level, 600),
          volume: level ? Math.min(0.4, 1 - 0.9 + level * 0.1) : 1,
        });
        currentCell.transitionStart(newColor, startPoint);
      },
      onUpdate: (tween) => currentCell.transitionUpdate(tween.getValue()),
      onComplete: () => {
        const targetColor = this.scene.gameStates.targetColor;

        if (startColor === targetColor) this.scene.gameStates.remains++;

        currentCell.transitionEnd();

        if (currentCell.color === targetColor) {
          this.scene.gameStates.remains--;
        }

        this.pendingCalls--;

        if (this.pendingCalls === 0) {
          while (
            this.timedCellsQueue.length > 0 &&
            this.timedCellsQueue[this.timedCellsQueue.length - 1].turns ===
              this.scene.gameStates.turns
          ) {
            const { pos, color } = this.timedCellsQueue.pop()!;
            if (this.board[pos[0]][pos[1]].color !== color) {
              this.flip(
                pos[0],
                pos[1],
                this.board[pos[0]][pos[1]].color,
                color
              );
              return;
            }
          }

          this.scene.changeGameState(GameStatus.Active);
        }
      },
    });
  }
}
