import { Scene } from "phaser";
import { simpleColor } from "../shaders";

enum Colors {
  "red" = 0,
  "green",
  "blue",
}

const colors = {
  0: { x: 1, y: 0, z: 0 },
  1: { x: 0, y: 1, z: 0 },
  2: { x: 0, y: 0, z: 1 },
};

const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  // [1, 1],
  // [-1, 1],
  // [1, -1],
  // [-1, -1],
];

class Grid {
  scene: Phaser.Scene;
  colorShaders: {
    [key: string]: Phaser.Display.BaseShader | undefined;
  } = {
    red: new Phaser.Display.BaseShader("redClr", simpleColor, undefined, {
      color: { type: "3f", value: { x: 1, y: 0, z: 0 } },
    }),
    green: new Phaser.Display.BaseShader("greenClr", simpleColor, undefined, {
      color: { type: "3f", value: { x: 0, y: 1, z: 0 } },
    }),
    blue: new Phaser.Display.BaseShader("blueClr", simpleColor, undefined, {
      color: { type: "3f", value: { x: 0, y: 0, z: 1 } },
    }),
  };

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

  bfs(x: number, y: number, target, newColor, seen: Set<Cell>) {
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
      // this.bfs(x + dx, y + dy, target, newColor, seen);
    }
  }

  flip(x, y, target, newColor) {
    this.bfs(x, y, target, newColor, new Set());
  }
}

class Cell {
  tile;
  color;
  grid;

  pos: { x: number; y: number };
  constructor(grid: Grid, x: number, y: number, color: number) {
    // console.log("shaders", grid.colorShaders);
    this.color = color;
    this.grid = grid;

    const shader = grid.colorShaders[Colors[color]];
    // console.log(shader, Colors[color]);
    this.tile = grid.scene.add.shader(
      shader,
      x * 110 + 100,
      y * 110 + 100,
      100,
      100
    );
    // this.tile.setUniform("color.value", { x: 0.5, y: 0.5, z: 0.5 });
    this.tile.setInteractive();
    this.tile.on("pointerdown", this.onClick, this);
    // console.log("wtf", this.tile);
    this.pos = { x, y };
  }

  onClick() {
    console.log("this.cell", this.tile);
    this.grid.flip(this.pos.x, this.pos.y, this.color, 1);
    // this.tile.setUniform("color.value", { x: 0.5, y: 0.5, z: 0.5 });
  }
}

export class Game extends Scene {
  grid;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("background", "bg.png");
    this.load.image("logo", "logo.png");
  }

  create(data) {
    // this.add.container()
    console.log("data", data);
    this.add.image(512, 384, "background");

    console.log(this.cache.shader);

    this.grid = new Grid(this, data.levelData);
    console.log(this.grid.cells);
    // square.setShader(blueSq);
  }
}
