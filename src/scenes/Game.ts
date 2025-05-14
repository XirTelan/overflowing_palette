import { Scene } from "phaser";
import {
  ColorConfig,
  ColorType,
  GameMode,
  GameSceneData,
  GameStates,
  GameStatus,
  LevelData,
  Tools,
} from "../types";
import Grid from "../classes/Grid";
import { Export } from "../classes/Game/Export";
import { SelectionBox } from "../classes/Game/SelectionBox";
import { ResultScreen } from "../classes/Game/ResultScreen";
import { Background } from "../classes/ui/Background";
import {
  cycleThroughColors,
  FADE_DELAY,
  generateLevel,
  getColorName,
  getConfig,
  getLocal,
} from "../utils";
import { ColorBtn } from "@/classes/ui/buttons/ColorBtn";
import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { ToolBtn } from "@/classes/ui/buttons/ToolBtn";
import { AudioManager } from "@/classes/common/AudioManager";
import { EditorModeUi } from "@/classes/Game/ui/EditorModeUi";
import { PlayerModeUi } from "@/classes/Game/ui/PlayerModeUi";
import { CommonUi } from "@/classes/Game/ui/CommonUi";
import { EditorManager } from "@/classes/Game/editor/EditorManager";

export class Game extends Scene {
  grid: Grid;
  colorSelectionButtons: ColorBtn[];
  toolsButtons: ToolBtn[];
  btnContainer: Phaser.GameObjects.Container;
  gameStates: GameStates;
  turnCounter: Phaser.GameObjects.Text;

  selectionBox: SelectionBox;
  editor: EditorManager;

  audioManager: AudioManager;

  notification: Phaser.GameObjects.Container;

  startTime: number;
  colors: ColorConfig;
  exportBlock: Export;

  constructor() {
    super("Game");
  }

  create({ mode, levelKey, levelData, endlessOptions }: GameSceneData) {
    const { colors } = getConfig(this);
    const {
      game: { ui },
    } = getLocal(this);
    this.colors = colors;
    this.toolsButtons = [];
    new Background(this);

    this.initGame(mode, levelData, levelKey ?? "");
    this.initAudioManager();

    if (mode === GameMode.Editor) {
      this.editor = new EditorManager(this);
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
    this.initTextUI();
    new CommonUi(this);

    this.exportBlock = new Export(this);

    this.startTime = this.time.now;
    this.cameras.main.fadeIn(FADE_DELAY, 0, 0, 0);
  }

  private initAudioManager() {
    const existing = this.registry.get("audioManager") as AudioManager;
    this.audioManager = existing?.setScene?.(this) ?? new AudioManager(this);
    this.registry.set("audioManager", this.audioManager);
  }

  changeGameState(state: GameStatus) {
    if (this.gameStates.state === state) return;

    const isEndless = this.gameStates.mode === GameMode.Endless;

    if (state === GameStatus.Waiting) {
      this.gameStates.turns = isEndless
        ? this.gameStates.turns + 1
        : this.gameStates.turns - 1;
      this.turnCounter.text = String(this.gameStates.turns);
      this.gameStates.state = GameStatus.Waiting;
      this.events.emit("turn", this.gameStates.turns);
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

  initGame(mode: GameStates["mode"], levelData: LevelData, levelKey: string) {
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

    this.gameStates = gameStates;

    this.grid = new Grid(this, levelData);

    this.colorSelectionButtons = [];

    this.btnContainer = this.add.container(1500, 400, []);
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
    this.audioManager.playSFX("reset");

    this.grid.resetBoard();
    const { initialState } = this.gameStates;
    this.gameStates.turns = initialState.turns;
    this.gameStates.remains = initialState.remains;
    this.turnCounter.text = String(this.gameStates.turns);
    this.gameStates.state = GameStatus.Active;
    this.toolsButtons.forEach((btn) => btn.reset());
  }

  private initTextUI() {
    const {
      game: { ui },
    } = getConfig(this);

    if (this.gameStates.mode == GameMode.Editor) {
      new EditorModeUi(this, ui);
    } else {
      new PlayerModeUi(this, ui);
    }
  }

  changeTargetColor(value: number) {
    let newTarget = cycleThroughColors(value, this.gameStates.targetColor);
    this.gameStates.targetColor = newTarget;
    this.grid.updateBorderTint();
    return getColorName(newTarget, this.colors);
  }
}
