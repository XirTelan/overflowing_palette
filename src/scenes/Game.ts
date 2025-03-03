import { Scene } from "phaser";
import {
  ColorType,
  GameStates,
  GameStatus,
  LevelData,
  Vector2,
} from "../types";
import Grid from "../classes/Grid";
import { colors } from "../utils";
import ColorBtn from "../classes/ColorBtn";

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;
  turnCounter: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  preload() {}

  create(levelData: LevelData) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.shader("distortion", width / 2, height / 2, width, height, [
      "background",
    ]);

    initShaderConfig(this.cache, { x: width, y: height });
    initGame(this, levelData);
    initTextUI(this);
    initButtons(this);

    // const key = this.input.keyboard?.addKey("L");
    // key?.on("down", (e) => {
    //   const arr = this.grid.board.map((cell) => {
    //     return cell.map((cell) => cell.color);
    //   });
    //   console.log("board", JSON.stringify(arr));
    // });
  }

  changeGameState(state: GameStatus) {
    if (state === GameStatus.Waiting) {
      this.gameStates.state = GameStatus.Waiting;
    }

    if (state === GameStatus.Active) {
      this.gameStates.state = GameStatus.Active;
      this.gameStates.turns = Math.max(0, this.gameStates.turns - 1);

      this.turnCounter.text = String(this.gameStates.turns);

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

function initShaderConfig(
  cache: Phaser.Cache.CacheManager,
  resolution: Vector2
) {
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
    screenResolution: { type: "2f", value: resolution },
  };
}

function initTextUI(scene: Game) {
  const {
    game: { ui },
  } = scene.cache.json.get("config");

  const turnRemainsText = scene.make.text({
    x: 60,
    y: 110,
    text: `Remaining Moves:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });
  scene.make.text({
    x: 60,
    y: 50,
    text: "Overflowing Palette",
    style: {
      color: "#ab9c6b",
      font: "26px OpenSans_Bold",
    },
  });

  scene.turnCounter = scene.make.text({
    x: 60 + turnRemainsText.width + 5,
    y: 110 - 5,
    text: `${scene.gameStates.turns}`,
    style: {
      color: "#ffcd3f",
      font: "26px OpenSans_ExtraBold",
    },
  });

  const targetColorText = scene.make.text({
    x: ui.targetUI.x,
    y: ui.targetUI.y,
    text: `Turn all the blocks into`,
    style: {
      color: `#cbcbcc`,
      font: "30px OpenSans_Regular",
    },
  });

  const targetColor = ColorType[scene.gameStates.targetColor];
  scene.make.text({
    x: targetColorText.x + targetColorText.width + 5,
    y: ui.targetUI.y,
    text: `${targetColor[0].toUpperCase()}${targetColor.slice(1)}`,
    style: {
      color: `rgb(${colors[scene.gameStates.targetColor].x * 255},${
        colors[scene.gameStates.targetColor].y * 255
      },${colors[scene.gameStates.targetColor].z * 255} )`,
      font: "30px OpenSans_Regular",
    },
  });

  let triangleWidth = 18;
  let triangleHeight = 30;
  let triangleProps = [-triangleWidth, 0, triangleWidth, 0, 0, triangleHeight];

  scene.add
    .triangle(
      targetColorText.x - triangleWidth * 3,
      ui.targetUI.y,
      ...triangleProps,
      0xffffff
    )
    .setOrigin(0, 0);

  scene.add
    .triangle(
      targetColorText.x - triangleWidth,
      ui.targetUI.y,
      ...triangleProps,
      0x94844c
    )
    .setOrigin(0, 0);

  scene.add.triangle(1500, 70, ...triangleProps, 0x94844c);
  scene.add.triangle(1500 + triangleWidth * 2, 70, ...triangleProps, 0x94844c);

  triangleWidth = 10;
  triangleHeight = -15;
  triangleProps = [-triangleWidth, 0, triangleWidth, 0, 0, triangleHeight];

  scene.add
    .triangle(1500, 870, ...triangleProps, 0x58595a)
    .setAlpha(0.8)
    .setOrigin(0, 0);
  scene.add
    .triangle(1500, 870 + triangleHeight, ...triangleProps, 0x58595a)
    .setAlpha(0.8)
    .setOrigin(0, 0);
}

function initGame(scene: Game, levelData: LevelData) {
  const gameStates: GameStates = {
    turns: levelData.turns,
    targetColor: levelData.targetColor,
    selectedColor: ColorType.red,
    state: GameStatus.Active,
    remains: 0,
    mode: "Play",
  };

  scene.gameStates = gameStates;

  scene.grid = new Grid(scene, levelData.board);

  scene.colorSelectionButtons = [];

  scene.btnContainer = scene.add.container(1500, 400, []);
}

function initButtons(scene: Game) {
  const {
    game: { ui },
  } = scene.cache.json.get("config");
  const cellSize = 100; // temp

  Object.entries(colors).forEach((color, indx) => {
    const newBtn = new ColorBtn(
      scene,
      0,
      indx * (cellSize + ui.colorButtons.gap),
      cellSize,
      [Number(color[0]), color[1]],
      indx + 1,
      scene.btnContainer
    );
    scene.colorSelectionButtons.push(newBtn);
  });

  scene.btnContainer.y -= (scene.colorSelectionButtons.length * 80) / 2;

  const resetImage = scene.add
    .image(scene.btnContainer.x, scene.cameras.main.height - 140, "resetBtn")
    .setScale(0.8);

  const hotkeyBtn = scene.make.image({
    x: resetImage.x - 30,
    y: resetImage.y + 80,
    key: "hotkey_btn",
    scale: 0.15,
  });

  scene.make
    .text({
      x: hotkeyBtn.x,
      y: hotkeyBtn.y,
      text: `R`,
      style: {
        color: "#3e3e3e",
        font: "24px OpenSans_Bold",
      },
    })
    .setOrigin(0.5, 0.5);

  scene.make
    .text({
      x: hotkeyBtn.x + 60,
      y: hotkeyBtn.y,
      text: `Reset`,
      style: {
        color: "#ffffff",
        font: "24px OpenSans_Bold",
      },
    })
    .setOrigin(0.5, 0.5);
}
