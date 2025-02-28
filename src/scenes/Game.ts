import { Scene } from "phaser";
import { ColorType, GameStatus, LevelData, Vector3 } from "../types";
import Grid from "../Grid";
import { colors } from "../utils";
import ColorBtn from "../ColorBtn";

type GameStates = {
  turns: number;
  state: GameStatus;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
};

export class Game extends Scene {
  grid: Grid;
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.glsl("base", "shaders/base.glsl");
    this.load.glsl("distortion", "shaders/distortion.glsl");

    this.load.image("background", "bg.png");
    this.load.image("celltexture", "celltexture.png");
    this.load.image("cellnoise", "cellnoise.png");
    // this.load.image("logo", "logo.png");
  }

  create({ levelData }: { levelData: LevelData }) {
    const background = this.add.shader("distortion", 512, 384, 1024, 768, [
      "background",
    ]);
    this.initShaderConfig();

    const gameStates: GameStates = {
      turns: levelData.turns,
      targetColor: levelData.targetColor,
      selectedColor: ColorType.red,
      state: GameStatus.Active,
      remains: 0,
    };

    this.gameStates = gameStates;

    this.grid = new Grid(this, levelData.board);

    this.btnContainer = this.add.container(950, 100, []);
    Object.entries(colors).forEach((color, indx) => {
      new ColorBtn(this, 0, indx * 100, 80, color, this.btnContainer);
    });
  }

  changeGameState(state: GameStatus) {
    if (state === GameStatus.Waiting) {
      this.gameStates.state = GameStatus.Waiting;
    }

    if (state === GameStatus.Active) {
      this.gameStates.state = GameStatus.Active;

      if (this.gameStates.remains === 0) {
        this.scene.restart();
      }
    }
  }

  private initShaderConfig() {
    const shader = this.cache.shader.get("base");
    shader.uniforms = {
      color: {
        type: "3f",
        value: { x: 1, y: 1, z: 1 },
      },
      colorToTransform: {
        type: "3f",
        value: { x: 1, y: 1, z: 1 },
      },
      radius: { type: "1f", value: 0.2 },
      transition: { type: "1f", value: 0.0 },
      active: { type: "1f", value: 0.0 },
      transparent: { type: "1f", value: 0.0 },
    };
  }
}
