import { Scene } from "phaser";
import {
  ColorConfig,
  ColorType,
  GameConfig,
  GameMode,
  GameSceneData,
  GameStates,
  GameStatus,
  LevelData,
  Tools,
  UiOptions,
} from "../types";
import Grid from "../classes/Grid";
import ColorBtn from "../classes/ui/ColorBtn";
import { ValueSelector } from "../classes/ui/ValueSelector";
import { Export } from "../classes/Game/Export";
import { SelectionBox } from "../classes/Game/SelectionBox";
import { ResultScreen } from "../classes/Game/ResultScreen";
import { Background } from "../classes/ui/Background";
import {
  availableTools,
  cycleThroughColors,
  generateLevel,
  getColorName,
  getLocal,
} from "../utils";
import { PrimaryBtn } from "../classes/ui/PrimaryBtn";
import { ToolBtn } from "../classes/ui/ToolBtn";

const FADE_DELAY = 500;

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  toolsButtons: ToolBtn[] = [];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;
  turnCounter: Phaser.GameObjects.Text;
  selectionBox: SelectionBox;

  notification: Phaser.GameObjects.Container;

  startTime: number;
  colors: ColorConfig;
  exportBlock: Export;

  constructor() {
    super("Game");
  }

  preload() {}

  create({ mode, levelKey, levelData, endlessOptions }: GameSceneData) {
    const { colors, gameplay } = this.cache.json.get("config") as GameConfig;
    const {
      game: { ui },
    } = getLocal(this);
    this.colors = colors;

    new Background(this);

    initGame(this, mode, levelData, levelKey ?? "");

    if (mode === GameMode.Editor) {
      this.selectionBox = new SelectionBox(this.grid.board, this);
    }
    if (mode == GameMode.Endless) {
      this.gameStates.endlessOptions = endlessOptions;
      new PrimaryBtn(1250, 990, ui.skipBtn, 350, 50, this, () => {
        this.scene.start("LoadingGame", {
          mode,
          levelKey,
          levelData: generateLevel(
            endlessOptions!.rows,
            endlessOptions!.columns,
            endlessOptions!.colorsCount,
            endlessOptions!.difficulty
          ),
          endlessOptions,
        });
      });
    }
    this.initTextUI(this);
    this.initButtons();

    this.sound.setVolume((gameplay.sound ?? 50) / 100);
    this.exportBlock = new Export(this);

    this.startTime = this.time.now;
    this.cameras.main.fadeIn(FADE_DELAY, 0, 0, 0);
  }

  changeGameState(state: GameStatus) {
    const isEndless = this.gameStates.mode === GameMode.Endless;

    if (state === GameStatus.Waiting) {
      this.gameStates.turns = isEndless
        ? this.gameStates.turns + 1
        : this.gameStates.turns - 1;
      this.turnCounter.text = String(this.gameStates.turns);
      this.gameStates.state = GameStatus.Waiting;
      return;
    }

    if (state === GameStatus.Active) {
      if (this.gameStates.remains === 0) {
        this.gameStates.state = GameStatus.Waiting;
        new ResultScreen(this);
        return;
      }

      if (!isEndless && this.gameStates.turns === 0) {
        this.resetGame();
      }

      this.gameStates.state = GameStatus.Active;
    }
  }

  setGameState(state: GameStatus) {
    this.gameStates.state = state;
  }

  changeSelectedColor(color: ColorType) {
    this.gameStates.selectedColor = color;
    this.colorSelectionButtons.forEach((btn) => btn.update());
  }

  private initButtons() {
    if (
      this.gameStates.mode != GameMode.Editor &&
      this.gameStates.availableTools
    ) {
      this.createToolsButtons();
    }
    this.createColorSelectionButtons();
    createResetButton(this);
    createCloseButton(this);
  }
  createColorSelectionButtons() {
    const scene = this;
    const {
      game: { ui },
      colors,
    } = scene.cache.json.get("config") as GameConfig;

    const cellSize = ui.colorButtons.size;
    const isEditorMode = scene.gameStates.mode === GameMode.Editor;

    scene.gameStates.availableColors.add(scene.gameStates.targetColor);

    const colorsCount = isEditorMode
      ? 8
      : scene.gameStates.availableColors.size;

    const availableColors = Object.entries(colors).filter(
      ([colorType]) =>
        isEditorMode || scene.gameStates.availableColors.has(Number(colorType))
    );
    availableColors.forEach(([colorType, colorValue], index) => {
      const colorId = Number(colorType);

      const offsetX =
        colorsCount > 4 && index >= 4 ? cellSize + ui.colorButtons.gap * 2 : 0;
      const adjustedIndex = (index + 4) % 4;
      const offsetY = adjustedIndex * (cellSize + ui.colorButtons.gap);

      const newBtn = new ColorBtn(
        scene,
        offsetX,
        offsetY,
        cellSize,
        [colorId, colorValue.value],
        index + 1,
        scene.btnContainer
      );
      scene.colorSelectionButtons.push(newBtn);
    });

    scene.btnContainer.y -= (scene.colorSelectionButtons.length * cellSize) / 4;
  }

  createToolsButtons() {
    let count = 0;
    this.gameStates.availableTools?.forEach((toolCount, indx) => {
      if (toolCount == 0) return;

      this.toolsButtons.push(
        new ToolBtn(
          this,
          150,
          600 + count * 160,
          toolCount,
          availableTools[(indx + 1) as keyof typeof availableTools].hotkey,
          indx + 1
        )
      );
      count++;
    });
  }

  changeSelectedTool(tool: Tools) {
    if (this.gameStates.selectedTool === tool) return;
    this.notification?.destroy();

    if (tool !== Tools.none) {
      const {
        game: { ui },
      } = getLocal(this);
      const { width } = this.cameras.main;
      const container = this.add.container(width / 2, 100);
      this.notification = container;
      const textBg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.4);

      const textBlock = this.add
        .text(0, 0, ui.toolSelected, {
          font: "24px OpenSans_Bold",
        })
        .setOrigin(0.5);

      this.notification.add(textBg);
      this.notification.add(textBlock);

      textBg.displayWidth = textBlock.width + 30;
    }
    this.gameStates.selectedTool = tool;
    this.toolsButtons.forEach((btn) => btn.update());
  }

  useTool(tool: Tools) {
    this.toolsButtons.find((btn) => btn.toolKey === tool)?.decrease();
  }

  resetGame() {
    this.sound.play("reset");

    this.grid.resetBoard();
    const { initialState } = this.gameStates;
    if (this.gameStates.mode !== GameMode.Editor) {
      this.gameStates.turns = initialState.turns;
      this.gameStates.remains = initialState.remains;
      this.turnCounter.text = String(this.gameStates.turns);
      this.gameStates.state = GameStatus.Active;
      this.toolsButtons.forEach((btn) => btn.reset());
    }
  }

  private initTextUI(scene: Game) {
    const {
      game: { ui },
    } = scene.cache.json.get("config") as GameConfig;

    const local = getLocal(scene);

    if (scene.gameStates.mode == GameMode.Editor) {
      this.loadEditorUI(scene, ui);
    } else {
      this.loadPlayUI(scene, ui);
    }
    this.time.delayedCall(50, () => {
      this.createTitle(scene, local.game.ui.mode);
    });

    this.createTriangles(scene, ui);
  }
  private loadEditorUI(scene: Game, ui: UiOptions) {
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

    new PrimaryBtn(150, 650, local.game.ui.export, 300, 50, this, () => {
      this.exportBlock.show();
    });

    new ValueSelector<string>(
      scene,
      ui.targetValueSelector.x,
      ui.targetValueSelector.y,
      ui.targetValueSelector.width,
      getColorName(scene.gameStates.targetColor, this.colors),
      () => {
        return changeTargetColor(-1, scene);
      },
      () => {
        return changeTargetColor(1, scene);
      }
    );

    scene.make.text({
      x: 60,
      y: 290,
      text: local.game.ui.tools,
      style: {
        color: "#fff",
        font: "22px OpenSans_Regular",
      },
    });

    Object.entries(availableTools).forEach(([key, data], index) => {
      scene.make.text({
        x: 60,
        y: ui.tools.y + ui.tools.offset * index - 50,
        text: local.game.tools[data.textKey],
        style: {
          color: "#fff",
          font: "22px OpenSans_Regular",
        },
      });

      new ValueSelector<number>(
        scene,
        ui.tools.x,
        ui.tools.y + ui.tools.offset * index,
        ui.targetValueSelector.width,
        scene.gameStates.availableTools[index],
        () => {
          this.gameStates.availableTools[index] = Phaser.Math.Clamp(
            this.gameStates.availableTools[index] - 1,
            0,
            100
          );
          return this.gameStates.availableTools[index];
        },
        () => {
          this.gameStates.availableTools[index] = Phaser.Math.Clamp(
            this.gameStates.availableTools[index] + 1,
            0,
            100
          );
          return this.gameStates.availableTools[index];
        }
      );
    });
  }

  private loadPlayUI(scene: Game, ui: UiOptions) {
    const colors = scene.colors;

    const local = getLocal(scene);

    scene.add.rectangle(50, 100, 230, 40, 0x000000, 0.8).setOrigin(0);

    const turnRemainsText = scene.make.text({
      x: 60,
      y: 110,
      text:
        this.gameStates.mode === GameMode.Endless
          ? local.game.ui.movesUsed
          : local.game.ui.movesRemain,
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

    const textBg = scene.add
      .rectangle(
        ui.targetUI.x - 100,
        ui.targetUI.y - 10,
        550,
        50,
        0x000000,
        0.8
      )
      .setOrigin(0);

    const targetColorText = scene.make.text({
      x: ui.targetUI.x,
      y: ui.targetUI.y,
      text: local.game.ui.targetColor,
      style: {
        color: `#cbcbcc`,
        font: "30px OpenSans_Regular",
      },
    });

    const targetColor = colors[scene.gameStates.targetColor].colorName;

    const colorNameText = scene.make.text({
      x: targetColorText.x + targetColorText.width + 5,
      y: ui.targetUI.y,
      text: `${targetColor[0].toUpperCase()}${targetColor.slice(1)}`,
      style: {
        color: `rgb(${colors[scene.gameStates.targetColor].value.x * 255},${
          colors[scene.gameStates.targetColor].value.y * 255
        },${colors[scene.gameStates.targetColor].value.z * 255} )`,
        font: "30px OpenSans_Regular",
      },
    });

    textBg.displayWidth = targetColorText.width + colorNameText.width + 120;
  }

  private createTitle(scene: Game, mode: string) {
    const icon = scene.add
      .image(60, 50, "uiatlas", "icon")
      .setScale(0.5)
      .setOrigin(0);
    scene.make.text({
      x: icon.x + 50,
      y: icon.y,
      text: `Overflowing Palette ${
        scene.gameStates.mode === GameMode.Editor ? `| ${mode}` : ""
      }`,
      style: {
        color: "#ab9c6b",
        font: "26px OpenSans_Bold",
      },
    });
  }

  private createTriangles(scene: Game, ui: UiOptions) {
    const commonProps1 = [0, 30, -20, 0, 20, 0];
    const commonProps2 = [80, 0, 25, -15, 0, 15, 0, 0x94844c];
    const commonProps3 = [0, -20, -10, 0, 10, 0, 0xffffff, 0.2];

    scene.add.triangle(
      ui.targetUI.x - 45,
      ui.targetUI.y + 15,
      ...commonProps1,
      0xffffff
    );
    scene.add.triangle(
      ui.targetUI.x - 5,
      ui.targetUI.y + 15,
      ...commonProps1,
      0x94844c
    );

    scene.add.triangle(scene.btnContainer.x - 10, ...commonProps2);
    scene.add.triangle(scene.btnContainer.x + 20, ...commonProps2);

    scene.add.triangle(
      scene.btnContainer.x + 10,
      scene.cameras.main.height - 240,
      ...commonProps3
    );
    scene.add.triangle(
      scene.btnContainer.x + 10,
      scene.cameras.main.height - 220,
      ...commonProps3
    );
  }
}

function createResetButton(scene: Game) {
  const { resetBtn } = scene.cache.json.get("config")["game"]["ui"];

  const local = getLocal(scene);

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
    text: "R",
    x: hotkeyBtn.x,
    y: hotkeyBtn.y,
  });

  scene.make.text({
    ...resetBtn.text,
    text: local.game.ui.resetBtn,
    x: hotkeyBtn.x + 60,
    y: hotkeyBtn.y,
  });

  const keyObj = scene.input.keyboard?.addKey("R");
  if (keyObj) keyObj.on("down", scene.resetGame, scene);

  resetImage.setInteractive();
  resetImage.on("pointerup", () => {
    if (scene.gameStates.state === GameStatus.Waiting) return;
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

  closeBtn.on("pointerup", () => {
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
    availableTools: levelData.tools ?? [0, 0, 0],
    selectedColor: ColorType.red,
    availableColors: new Set(),
    state: GameStatus.Active,
    remains: 0,
    mode: mode,
    initialState: {
      turns: levelData.turns,
      remains: 0,
    },
    selectedTool: Tools.none,
  };

  scene.gameStates = gameStates;

  scene.grid = new Grid(scene, levelData.board);

  scene.colorSelectionButtons = [];

  scene.btnContainer = scene.add.container(1500, 400, []);
}

function changeTargetColor(value: number, scene: Game) {
  let newTarget = cycleThroughColors(value, scene.gameStates.targetColor);
  scene.gameStates.targetColor = newTarget;
  scene.grid.updateBorderTint();
  return getColorName(newTarget, scene.colors);
}
