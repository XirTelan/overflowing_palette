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
import ColorBtn from "../classes/ui/ColorBtn";
import { ValueSelector } from "../classes/ui/ValueSelector";
import { Export } from "../classes/Game/Export";

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

  create({
    mode,
    levelData,
  }: {
    mode: GameStates["mode"];
    levelData: LevelData;
  }) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.shader("distortion", width / 2, height / 2, width, height, [
      "background",
    ]);

    initShaderConfig(this.cache, { x: width, y: height });
    initGame(this, mode, levelData);
    initTextUI(this);
    this.initButtons();
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
        this.scene.restart(); //[CHECK] Need to "gameover screen"
      }
      if (this.gameStates.turns == 0) {
        this.scene.restart();
      }
    }
  }
  changeSelectedColor(color: ColorType) {
    this.gameStates.selectedColor = color;
    this.colorSelectionButtons.forEach((btn) => btn.update());
  }

  private initButtons() {
    const scene = this;
    const {
      game: { ui },
    } = scene.cache.json.get("config");

    const cellSize = 100; // temp

    Object.entries(colors).forEach(([colorType, colorValue], indx) => {
      if (
        scene.gameStates.mode === "Play" &&
        !scene.gameStates.availableColors.has(Number(colorType))
      )
        return;

      const newBtn = new ColorBtn(
        scene,
        0,
        indx * (cellSize + ui.colorButtons.gap),
        cellSize,
        [Number(colorType), colorValue],
        indx + 1,
        scene.btnContainer
      );
      scene.colorSelectionButtons.push(newBtn);
    });

    scene.btnContainer.y -= (scene.colorSelectionButtons.length * 80) / 2;

    createResetButton(this);
    createCloseButton(this);
  }
}

function createResetButton(scene: Game) {
  const { resetBtn } = scene.cache.json.get("config")["game"]["ui"];

  const resetImage = scene.add
    .image(
      scene.btnContainer.x,
      scene.cameras.main.height - 140,
      "uiatlas",
      "resetBtn"
    )
    .setScale(0.8);

  const overlay = scene.add
    .image(
      scene.btnContainer.x,
      scene.cameras.main.height - 140,
      "uiatlas",
      "resetBtn_over"
    )
    .setScale(0.8);

  overlay.setVisible(false);

  const hotkeyBtn = scene.make.image({
    ...resetBtn.hotkeyBtn,
    x: resetImage.x - 30,
    y: resetImage.y + 80,
  });

  scene.make.text({
    ...resetBtn.hotkeyText,
    x: hotkeyBtn.x,
    y: hotkeyBtn.y,
  });

  scene.make.text({
    ...resetBtn.text,
    x: hotkeyBtn.x + 60,
    y: hotkeyBtn.y,
  });

  resetImage.setInteractive();
  resetImage.on("pointerdown", () => {
    scene.grid.resetBoard();
  });
  resetImage.on("pointerover", () => {
    overlay.setVisible(true);
  });
  resetImage.on("pointerout", () => {
    overlay.setVisible(false);
  });
}

function createCloseButton(scene: Game) {
  const {
    game: { ui },
  } = scene.cache.json.get("config");

  const closeBtn = scene.add
    .image(
      scene.cameras.main.width - ui.closeBtn.offset.x,
      0 + ui.closeBtn.offset.y,
      "uiatlas",
      "closeBtn"
    )
    .setScale(ui.closeBtn.scale);

  closeBtn.setInteractive();

  closeBtn.on("pointerdown", () => {
    scene.scene.start("MainMenu");
  });
  closeBtn.on("pointerover", () => {
    closeBtn.setScale(ui.closeBtn.scale + 0.1);
  });
  closeBtn.on("pointerout", () => {
    closeBtn.setScale(ui.closeBtn.scale);
  });
}

function initShaderConfig(
  cache: Phaser.Cache.CacheManager,
  resolution: Vector2
) {
  const shader = cache.shader.get("base");
  const { shaders } = cache.json.get("config");
  shader.uniforms = {
    ...shaders.base,
    screenResolution: { type: "2f", value: resolution },
  };
}

function initTextUI(scene: Game) {
  const {
    game: { ui },
  } = scene.cache.json.get("config");

  if (scene.gameStates.mode == "Editor") {
    loadEditorUI(scene, ui);
  }
  if (scene.gameStates.mode == "Play") {
    loadPlayUI(scene, ui);
  }

  scene.make.text({
    x: 60,
    y: 50,
    text: `Overflowing Palette ${
      scene.gameStates.mode === "Editor" ? "| Mode:Editor" : ""
    }`,
    style: {
      color: "#ab9c6b",
      font: "26px OpenSans_Bold",
    },
  });
}

function initGame(scene: Game, mode: GameStates["mode"], levelData: LevelData) {
  const gameStates: GameStates = {
    turns: levelData.turns,
    targetColor: levelData.targetColor,
    selectedColor: ColorType.red,
    availableColors: new Set(),
    state: GameStatus.Active,
    remains: 0,
    mode: mode,
  };

  scene.gameStates = gameStates;

  scene.grid = new Grid(scene, levelData.board);

  scene.colorSelectionButtons = [];

  scene.btnContainer = scene.add.container(1500, 400, []);
}
function loadPlayUI(scene: Game, ui) {
  const turnRemainsText = scene.make.text({
    x: 60,
    y: 110,
    text: `Remaining Moves:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
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
}
function loadEditorUI(scene: Game, ui) {
  scene.make.text({
    x: 60,
    y: 110,
    text: `Moves count:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });
  scene.make.text({
    x: 60,
    y: 200,
    text: `Target color:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });

  new ValueSelector<number>(
    scene,
    ui.turnsValueSelector.x,
    ui.turnsValueSelector.y,
    ui.turnsValueSelector.width,
    scene.gameStates.turns,
    () => {
      return --scene.gameStates.turns;
    },
    () => {
      return ++scene.gameStates.turns;
    }
  );

  new Export(scene);

  new ValueSelector<string>(
    scene,
    ui.targetValueSelector.x,
    ui.targetValueSelector.y,
    ui.targetValueSelector.width,
    getColorName(scene.gameStates.targetColor),
    () => {
      return changeTargetColor(-1, scene);
    },
    () => {
      return changeTargetColor(1, scene);
    }
  );
}

function changeTargetColor(value: number, scene: Game) {
  const curTarget = scene.gameStates.targetColor;
  const maxValue = Object.keys(ColorType).length / 2;
  let newTarget = (((curTarget + value) % maxValue) + maxValue) % maxValue;
  scene.gameStates.targetColor = newTarget;
  scene.grid.updateBorderTint();
  return getColorName(newTarget);
}

function getColorName(indx: number) {
  const str = ColorType[indx];
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
