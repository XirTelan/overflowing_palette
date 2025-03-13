import { Scene } from "phaser";
import {
  ColorType,
  GameStates,
  GameStatus,
  LevelData,
  UiOptions,
  Vector3,
} from "../types";
import Grid from "../classes/Grid";
import { cicleThrougColors, getColorName, getLocal } from "../utils";
import ColorBtn from "../classes/ui/ColorBtn";
import { ValueSelector } from "../classes/ui/ValueSelector";
import { Export } from "../classes/Game/Export";
import { SelectionBox } from "../classes/Game/SelectionBox";
import { ResultScreen } from "../classes/Game/ResultScreen";

const FADE_DELAY = 500;

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;
  turnCounter: Phaser.GameObjects.Text;
  selectionBox: SelectionBox;
  startTime: number;
  colors: Record<number, Vector3>;

  constructor() {
    super("Game");
  }

  preload() {}

  create({
    mode,
    levelKey,
    levelData,
  }: {
    mode: GameStates["mode"];
    levelKey: string;
    levelData: LevelData;
  }) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const { colors } = this.cache.json.get("config");
    this.colors = colors;

    this.add.shader("distortion", width / 2, height / 2, width, height, [
      "background",
    ]);

    initGame(this, mode, levelData, levelKey);
    if (mode === "Editor") {
      this.selectionBox = new SelectionBox(this.grid.board, this);
    }
    initTextUI(this);
    this.initButtons();
    this.startTime = this.time.now;
    this.cameras.main.fadeIn(FADE_DELAY, 0, 0, 0);
  }

  changeGameState(state: GameStatus) {
    if (state === GameStatus.Waiting) {
      this.gameStates.turns = Math.max(0, this.gameStates.turns - 1);
      this.turnCounter.text = String(this.gameStates.turns);
      this.gameStates.state = GameStatus.Waiting;
    }

    if (state === GameStatus.Active) {
      this.gameStates.state = GameStatus.Active;

      if (this.gameStates.remains === 0) {
        new ResultScreen(430, 400, this);
      } else if (this.gameStates.turns == 0) {
        this.resetGame();
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

    const cellSize = ui.colorButtons.size;
    const { colors } = scene.cache.json.get("config") as {
      colors: Record<number, Vector3>;
    };

    Object.entries(colors)
      .filter(
        ([colorType]) =>
          !(
            scene.gameStates.mode === "Play" &&
            !scene.gameStates.availableColors.has(Number(colorType))
          )
      )
      .forEach(([colorType, colorValue], indx) => {
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

  resetGame() {
    if (this.gameStates.state === GameStatus.Waiting) return;
    this.grid.resetBoard();
    const { initialState } = this.gameStates;
    if (this.gameStates.mode === "Play") {
      this.gameStates.turns = initialState.turns;
      this.gameStates.remains = initialState.remains;
      this.turnCounter.text = String(this.gameStates.turns);
      this.gameStates.state = GameStatus.Active;
    }
  }
}

function createResetButton(scene: Game) {
  const { resetBtn } = scene.cache.json.get("config")["game"]["ui"];

  const resetImage = scene.add
    .image(
      scene.btnContainer.x,
      scene.cameras.main.height - 140,
      "uiatlas",
      "reset"
    )
    .setScale(0.8);

  const overlay = scene.add
    .image(
      scene.btnContainer.x,
      scene.cameras.main.height - 140,
      "uiatlas",
      "reset_over"
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

  const keyObj = scene.input.keyboard?.addKey("R");
  if (keyObj) keyObj.on("down", scene.resetGame, scene);

  resetImage.setInteractive();
  resetImage.on("pointerdown", () => {
    scene.resetGame();
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
      "close"
    )
    .setScale(ui.closeBtn.scale);

  closeBtn.setInteractive();

  closeBtn.on("pointerdown", () => {
    scene.cameras.main.fadeOut(FADE_DELAY, 0, 0, 0);
    scene.time.delayedCall(FADE_DELAY, () => {
      scene.scene.start("MainMenu");
    });
  });
  closeBtn.on("pointerover", () => {
    closeBtn.setScale(ui.closeBtn.scale + 0.1);
  });
  closeBtn.on("pointerout", () => {
    closeBtn.setScale(ui.closeBtn.scale);
  });
}

function initTextUI(scene: Game) {
  const {
    game: { ui },
  } = scene.cache.json.get("config");

  const local = getLocal(scene);

  if (scene.gameStates.mode == GameMode.Editor) {
    loadEditorUI(scene, ui);
  }
  if (scene.gameStates.mode == "Play") {
    loadPlayUI(scene, ui);
  }
  const icon = scene.add
    .image(60, 50, "uiatlas", "icon")
    .setScale(0.5)
    .setOrigin(0);
  scene.make.text({
    x: icon.x + 50,
    y: icon.y,
    text: `Overflowing Palette ${
      scene.gameStates.mode === GameMode.Editor ? `| ${local.game.ui.mode}` : ""
    }`,
    style: {
      color: "#ab9c6b",
      font: "26px OpenSans_Bold",
    },
  });
  //[TODO] replace with eitherr config or texture
  let commonProps = [0, 30, -20, 0, 20, 0];
  scene.add.triangle(
    ui.targetUI.x - 45,
    ui.targetUI.y + 15,
    ...commonProps,
    0xffffff
  );
  scene.add.triangle(
    ui.targetUI.x - 5,
    ui.targetUI.y + 15,
    ...commonProps,
    0x94844c
  );

  commonProps = [80, 0, 25, -15, 0, 15, 0, 0x94844c];

  scene.add.triangle(scene.btnContainer.x - 10, ...commonProps);
  scene.add.triangle(scene.btnContainer.x + 20, ...commonProps);

  commonProps = [0, -20, -10, 0, 10, 0, 0xffffff, 0.2];

  scene.add.triangle(
    scene.btnContainer.x + 10,
    scene.cameras.main.height - 240,
    ...commonProps
  );
  scene.add.triangle(
    scene.btnContainer.x + 10,
    scene.cameras.main.height - 220,
    ...commonProps
  );
}

function initGame(
  scene: Game,
  mode: GameStates["mode"],
  levelData: LevelData,
  levelKey: string
) {
  const gameStates: GameStates = {
    levelKey,
    turns: levelData.turns,
    targetColor: levelData.targetColor,
    selectedColor: ColorType.red,
    availableColors: new Set(),
    state: GameStatus.Active,
    remains: 0,
    mode: mode,
    initialState: {
      turns: levelData.turns,
      remains: 0,
    },
  };

  scene.gameStates = gameStates;

  scene.grid = new Grid(scene, levelData.board);

  scene.colorSelectionButtons = [];

  scene.btnContainer = scene.add.container(1500, 400, []);
}
function loadPlayUI(scene: Game, ui: UiOptions) {
  const colors = scene.colors;

  const local = getLocal(scene);

  const turnRemainsText = scene.make.text({
    x: 60,
    y: 110,
    text: local.game.ui.turnsRemains,
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
    text: local.game.ui.targetColor,
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
function loadEditorUI(scene: Game, ui: UiOptions) {
  const local = getLocal(scene);

  scene.make.text({
    x: 60,
    y: 110,
    text: local.game.ui.movesCount,
    style: {
      color: "#fff",
      font: "22px OpenSans_Regular",
    },
  });
  scene.make.text({
    x: 60,
    y: 200,
    text: local.game.ui.targetColorEditor,
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
      scene.gameStates.turns = Math.max(1, scene.gameStates.turns - 1);
      return scene.gameStates.turns;
    },
    () => {
      scene.gameStates.turns = Math.min(50, scene.gameStates.turns + 1);
      return scene.gameStates.turns;
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
  let newTarget = cicleThrougColors(value, scene.gameStates.targetColor);
  scene.gameStates.targetColor = newTarget;
  scene.grid.updateBorderTint();
  return getColorName(newTarget);
}
