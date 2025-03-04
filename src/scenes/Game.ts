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

  resetImage.setInteractive();
  resetImage.on("pointerdown", () => {
    scene.grid.resetBoard();
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

  if (scene.gameStates.mode == "Editor") {
    loadEditorUI(scene, ui);
  }
  if (scene.gameStates.mode == "Play") {
    loadPlayUI(scene, ui);
  }

  const mainBtn = scene.add
    .image(160, 320, "mainBtn")
    .setOrigin(0.5, 0.5)
    .setScale(0.6);
  mainBtn.setInteractive();
  mainBtn.on("pointerdown", () => {
    const arr = scene.grid.board.map((cell) => {
      return cell.map((cell) => cell.color);
    });
    const jsonData: LevelData = {
      targetColor: scene.gameStates.targetColor,
      turns: scene.gameStates.turns,
      board: arr,
    };
    const formattedJson = JSON.stringify(jsonData, null, "\t");
    const jsonElement = scene.add.dom(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 - 100,
      "pre",
      {
        width: "1024px",
        height: "768px",
        background: "#121212",
        fontSize: "24px",
        padding: "10px",
        overflow: "auto",
      }
    );

    const copy = scene.add
      .image(scene.cameras.main.width / 2, 900, "mainBtn")
      .setOrigin(0.5, 0.5)
      .setScale(0.8);
    copy.setInteractive();
    copy.on("pointerdown", () => {
      navigator.clipboard.writeText(formattedJson);
      jsonElement.destroy();
      copy.destroy();
    });
    scene.make
      .text({
        x: copy.x,
        y: copy.y,
        text: "Copy to clipboard",
        style: {
          color: "#000",
          font: "24px OpenSans_Regular",
        },
      })
      .setOrigin(0.5, 0.5);

    jsonElement.setText(formattedJson);
    // jsonElement.innerText = formattedJson;
    // jsonElement.style.position = "absolute";
    // jsonElement.style.left = "50px";
    // jsonElement.style.top = "50px";
    // jsonElement.style.color = "white";
    // jsonElement.style.backgroundColor = "#222";
    // jsonElement.style.padding = "10px";
    // jsonElement.style.fontFamily = "monospace";
    // jsonElement.style.whiteSpace = "pre-wrap"; // Wrap text properly
    // jsonElement.style.width = "1024px"; // Limit width
    // jsonElement.style.maxHeight = "1080px"; // Limit width
  });

  scene.make
    .text({
      x: mainBtn.x,
      y: mainBtn.y,
      text: "Export",
      style: {
        color: "#000000",
        font: "24px OpenSans_Regular",
      },
    })
    .setOrigin(0.5, 0.5);

  const turnRemainsText = scene.make.text({
    x: 60,
    y: 110,
    text: `Moves count:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });
  const target = scene.make.text({
    x: 60,
    y: 200,
    text: `Target color:`,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });

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

  new ValueSelector<string>(
    scene,
    ui.targetValueSelector.x,
    ui.targetValueSelector.y,
    ui.targetValueSelector.width,
    ColorType[scene.gameStates.targetColor],
    () => {
      let value = scene.gameStates.targetColor;
      const maxValue = Object.keys(ColorType).length / 2 - 1;
      value = value - 1 < 0 ? maxValue : value - 1;
      scene.gameStates.targetColor = value;
      const str = ColorType[value];
      scene.grid.updateBorderTint();
      return `${str[0].toUpperCase()}${str.slice(1)}`;
    },
    () => {
      let value = scene.gameStates.targetColor;
      const maxValue = Object.keys(ColorType).length / 2 - 1;
      value = value + 1 > maxValue ? 0 : value + 1;
      scene.gameStates.targetColor = value;
      const str = ColorType[value];
      scene.grid.updateBorderTint();
      return `${str[0].toUpperCase()}${str.slice(1)}`;
    }
  );
}
