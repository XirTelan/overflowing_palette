import { Scene } from "phaser";

enum ColorType {
  "red",
  "green",
  "blue",
}

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

const colors: Record<ColorType, Vector3> = {
  [ColorType.red]: { x: 1, y: 0, z: 0 },
  [ColorType.green]: { x: 0, y: 1, z: 0 },
  [ColorType.blue]: { x: 0, y: 0, z: 1 },
};

const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

class Grid {
  scene: Phaser.Scene;

  board: Cell[][] = [];

  constructor(scene: Phaser.Scene, levelData: [][]) {
    this.scene = scene;

    const rows = levelData.length;
    const columns = levelData[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const newCell = new Cell(this, i, j, levelData[i][j]);
        this.board[i] ??= [];
        this.board[i][j] = newCell;
      }
    }
  }

  bfs(
    x: number,
    y: number,
    target: ColorType,
    newColor: ColorType,
    seen: Set<Cell>
  ) {
    if (
      !this.board[x] ||
      !this.board[x][y] ||
      this.board[x][y].color != target ||
      seen.has(this.board[x][y])
    )
      return;

    this.board[x][y].tile.setUniform("color.value", colors[newColor]);
    seen.add(this.board[x][y]);

    for (const [dx, dy] of dirs) {
      this.scene.time.delayedCall(
        200,
        this.bfs,
        [x + dx, y + dy, target, newColor, seen],
        this
      );
    }
  }

  flip(x, y, target, newColor) {
    console.log(x, y, target, newColor);
    this.bfs(x, y, target, newColor, new Set());
  }
}

class Cell {
  tile;
  color: ColorType;
  grid;

  pos: { x: number; y: number };
  constructor(grid: Grid, x: number, y: number, color: ColorType) {
    this.color = color;
    this.grid = grid;

    this.tile = grid.scene.add.shader(
      "base",
      x * 110 + 100,
      y * 110 + 100,
      100,
      100
    );
    this.tile.setUniform("color.value", colors[color]);
    this.tile.setInteractive();
    this.tile.on("pointerdown", this.onClick, this);
    this.pos = { x, y };
  }

  onClick() {
    this.grid.flip(this.pos.x, this.pos.y, this.color, 1);
  }
}

export class Game extends Scene {
  grid: Grid;
  selectedColor: ColorType;
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.glsl("base", "shaders/base.glsl");

    this.load.image("background", "bg.png");
    this.load.image("logo", "logo.png");
  }

  create(data) {
    this.add.image(512, 384, "background");
    this.initShaderConfig();

    this.grid = new Grid(this, data.levelData);
  }

  initShaderConfig() {
    const shader = this.cache.shader.get("base");
    shader.uniforms = {
      color: {
        type: "3f",
        value: { x: 1, y: 1, z: 1 },
      },
      isCircle: { type: "1f", value: 0 },
    };
  }
}
