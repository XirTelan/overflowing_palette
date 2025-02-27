import { Scene } from "phaser";
import { ColorType, LevelData } from "../types";
import Grid from "../Grid";
import { colors } from "../utils";

type GameStates = {
  turns: number;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
};

export class Game extends Scene {
  grid: Grid;
  gameStates: GameStates;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.glsl("base", "shaders/base.glsl");

    this.load.image("background", "bg_test.webp");
    this.load.image("logo", "logo.png");
  }

  create({ levelData }: { levelData: LevelData }) {
    this.add.image(512, 384, "background");
    this.initShaderConfig();


    const gameStates: GameStates = {
      turns: levelData.turns,
      targetColor: levelData.targetColor,
      selectedColor: ColorType.red,
      remains: 0,
    };

    this.gameStates = gameStates;

    this.grid = new Grid(this, levelData.board);

    const btns: Phaser.GameObjects.GameObject[] = [];

    Object.entries(colors).forEach((color, indx) => {
      const btn = this.add.shader("base", 0, indx * 100, 80, 80);

      btn.setUniform("color.value", color[1]);
      btn.setUniform("radius.value", 0.5);
      btns.push(btn);
    });

    const container = this.add.container(950, 100, btns);
  }

  initShaderConfig() {
    const shader = this.cache.shader.get("base");
    shader.uniforms = {
      color: {
        type: "3f",
        value: { x: 1, y: 1, z: 1 },
      },
      radius: { type: "1f", value: 0.2 },
    };
    console.log("shader", shader);
  }
}
