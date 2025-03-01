import { Scene } from "phaser";
import { ColorType, GameStatus, LevelData, Vector3 } from "../types";
import Grid from "../classes/Grid";
import { colors } from "../utils";
import ColorBtn from "../classes/ColorBtn";

type GameStates = {
  turns: number;
  state: GameStatus;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
};

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;

  constructor() {
    super("Game");
  }

  preload() {
    loadAssets(this.load);
  }

  create({ levelData }: { levelData: LevelData }) {
    const background = this.add.shader("distortion", 512, 384, 1024, 768, [
      "background",
    ]);

    initShaderConfig(this.cache);

    this.cache;
    const gameStates: GameStates = {
      turns: levelData.turns,
      targetColor: levelData.targetColor,
      selectedColor: ColorType.red,
      state: GameStatus.Active,
      remains: 0,
    };

    this.gameStates = gameStates;

    this.grid = new Grid(this, levelData.board);

    this.colorSelectionButtons = [];


    this.btnContainer = this.add.container(910, 100, []);
    Object.entries(colors).forEach((color, indx) => {
      const newBtn = new ColorBtn(
        this,
        0,
        indx * 100,
        80,
        color,
        this.btnContainer
      );
      this.colorSelectionButtons.push(newBtn);
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
  changeSelectedColor(color: ColorType) {
    this.gameStates.selectedColor = color;
    this.colorSelectionButtons.forEach((btn) => btn.update());
  }
}

function initShaderConfig(cache: Phaser.Cache.CacheManager) {
  const shader = cache.shader.get("base");
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
    curPoint: { type: "2f", value: { x: 0, y: 0 } },
    startPoint: { type: "2f", value: { x: 0, y: 0 } },
  };
}

function loadAssets(load: Phaser.Loader.LoaderPlugin) {
  load.setPath("assets");

  load.audio("mouseOver", "sound/mouseOver.mp3");
  load.audio("colorSelect", "sound/colorSelect.mp3");
  load.audio("tileFlip", "sound/tileFlip.mp3");

  load.image("celltexture", "celltexture.png");
  load.image("cellnoise", "cellnoise.png");
  load.image("cellnoise_d", "cellnoise_d.webp");
  load.image("cellnoise_center", "cellnoise_center.png");

  load.glsl("base", "shaders/base.glsl");
  load.glsl("distortion", "shaders/distortion.glsl");

  load.image("background", "bg.png");
  load.image("hotkey_btn", "ui/hotkey_btn.png");
}
