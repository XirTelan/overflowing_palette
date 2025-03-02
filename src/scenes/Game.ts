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

type LoadingConfig = {
  width: number;
  boxPadding: number;
  height: number;
};

const defaultLoadingConfig: LoadingConfig = {
  width: 300,
  boxPadding: 10,
  height: 30,
};

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;
  turnCounter: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  preload() {
    loadAssets(this);
  }

  create({ levelData }: { levelData: LevelData }) {
    this.add.shader("distortion", 512, 384, 1024, 768, ["background"]);

    initShaderConfig(this.cache);
    initGame(this, levelData);
    initTextUI(this);
    initButtons(this);
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

function loadAssets(
  scene: Game,
  loadingConfig: LoadingConfig = defaultLoadingConfig
) {
  const load = scene.load;

  const progressBar = scene.add.graphics();
  const progressBox = scene.add.graphics();

  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;

  progressBox.fillStyle(0x222222, 0.7);
  progressBox.fillRect(
    width / 2 - (loadingConfig.width + loadingConfig.boxPadding) / 2,
    height / 2 - (loadingConfig.height + loadingConfig.boxPadding) / 2,
    loadingConfig.width + loadingConfig.boxPadding,
    loadingConfig.height + loadingConfig.boxPadding
  );

  const loadingText = scene.make.text({
    x: width / 2,
    y: height / 2 - loadingConfig.height - loadingConfig.boxPadding,
    text: "Loading...",
    style: {
      font: "20px monospace",
      color: "#ffffff",
    },
  });
  loadingText.setOrigin(0.5, 0.5);

  const percentText = scene.make.text({
    x: width / 2,
    y: height / 2,
    text: "0%",
    style: {
      font: "18px monospace",
      color: "#ffffff",
    },
  });
  percentText.setOrigin(0.5, 0.5);

  const assetText = scene.make.text({
    x: width / 2,
    y: height / 2 + loadingConfig.height + loadingConfig.boxPadding,
    text: "",
    style: {
      font: "18px monospace",
      color: "#ffffff",
    },
  });
  assetText.setOrigin(0.5, 0.5);

  load.on("progress", function (value: number) {
    console.log(value);
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(
      width / 2 - loadingConfig.width / 2,
      height / 2 - loadingConfig.height / 2,
      loadingConfig.width * value,
      loadingConfig.height
    );
    percentText.setText(`${value * 100} %`);
  });

  load.on("fileprogress", function (file: Phaser.Loader.File) {
    console.log(file.src);
    assetText.setText(`Loading asset: ${file.src}`);
  });
  load.on("complete", function () {
    console.log("complete");
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
  });

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
  load.image("grid_border", "grid_border.png");
  load.image("hotkey_btn", "ui/hotkey_btn.webp");
  load.image("resetBtn", "ui/resetBtn.png");
}

function initTextUI(scene: Game) {
  const turnRemainsText = scene.make.text({
    x: 60,
    y: 10,
    text: `Remaining Moves:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });
  scene.turnCounter = scene.make.text({
    x: 60 + turnRemainsText.width + 5,
    y: 6,
    text: `${scene.gameStates.turns}`,
    style: {
      color: "#ffcd3f",
      font: "26px OpenSans_ExtraBold",
    },
  });

  const targetColorText = scene.make.text({
    x: 84,
    y: 720,
    text: `Turn all the blocks into`,
    style: {
      color: `#cbcbcc`,
      font: "20px OpenSans_Regular",
    },
  });

  const targetColor = ColorType[scene.gameStates.targetColor];
  scene.make.text({
    x: targetColorText.x + targetColorText.width + 5,
    y: 720,
    text: `${targetColor[0].toUpperCase()}${targetColor.slice(1)}`,
    style: {
      color: `rgb(${colors[scene.gameStates.targetColor].x * 255},${
        colors[scene.gameStates.targetColor].y * 255
      },${colors[scene.gameStates.targetColor].z * 255} )`,
      font: "20px OpenSans_Regular",
    },
  });

  let triangleWidth = 12;
  let triangleHeight = 20;
  let triangleProps = [-triangleWidth, 0, triangleWidth, 0, 0, triangleHeight];

  scene.add.triangle(60, 730, ...triangleProps, 0xffffff);
  scene.add.triangle(60 + triangleWidth * 2, 730, ...triangleProps, 0x94844c);
  scene.add.triangle(930, 70, ...triangleProps, 0x94844c);
  scene.add.triangle(930 + triangleWidth * 2, 70, ...triangleProps, 0x94844c);

  triangleWidth = 10;
  triangleHeight = -15;
  triangleProps = [-triangleWidth, 0, triangleWidth, 0, 0, triangleHeight];

  scene.add.triangle(940, 640, ...triangleProps, 0x58595a).setAlpha(0.8);
  scene.add
    .triangle(940, 640 + triangleHeight, ...triangleProps, 0x58595a)
    .setAlpha(0.8);
}

function initGame(scene: Game, levelData: LevelData) {
  const gameStates: GameStates = {
    turns: levelData.turns,
    targetColor: levelData.targetColor,
    selectedColor: ColorType.red,
    state: GameStatus.Active,
    remains: 0,
  };

  scene.gameStates = gameStates;

  scene.grid = new Grid(scene, levelData.board);

  scene.colorSelectionButtons = [];

  scene.btnContainer = scene.add.container(
    930,
    scene.cameras.main.height / 2,
    []
  );
}

function initButtons(scene: Game) {
  Object.entries(colors).forEach((color, indx) => {
    const newBtn = new ColorBtn(
      scene,
      0,
      indx * 80,
      60,
      [Number(color[0]), color[1]],
      indx + 1,
      scene.btnContainer
    );
    scene.colorSelectionButtons.push(newBtn);
  });

  scene.btnContainer.y -= (scene.colorSelectionButtons.length * 80) / 2;

  const resetImage = scene.add
    .image(scene.btnContainer.x, scene.cameras.main.height - 90, "resetBtn")
    .setScale(0.5);

  const hotkeyBtn = scene.make.image({
    x: resetImage.x - 30,
    y: resetImage.y + 50,
    key: "hotkey_btn",
    scale: 0.1,
  });

  scene.make
    .text({
      x: hotkeyBtn.x,
      y: hotkeyBtn.y,
      text: `R`,
      style: {
        color: "#3e3e3e",
        font: "18px OpenSans_Bold",
      },
    })
    .setOrigin(0.5, 0.5);

  scene.make
    .text({
      x: hotkeyBtn.x + 50,
      y: hotkeyBtn.y,
      text: `Reset`,
      style: {
        color: "#ffffff",
        font: "18px OpenSans_Bold",
      },
    })
    .setOrigin(0.5, 0.5);
}
