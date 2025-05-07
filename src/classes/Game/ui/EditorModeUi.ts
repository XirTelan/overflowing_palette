import { GameConfig, UiOptions } from "@/types";
import { getLocal, getColorName } from "@/utils";
import { PrimaryBtn } from "../../ui/buttons/PrimaryBtn";
import { ValueSelector } from "../../ui/ValueSelector";
import { Game } from "@/scenes/Game";
import { BaseBtn } from "../../ui/buttons/BaseBtn";
import { PortalEditor } from "../PortalEditor";

export class EditorModeUi {
  private scene: Game;
  private ui: UiOptions;
  private local: ReturnType<typeof getLocal>;
  editor!: PortalEditor;

  constructor(scene: Game, ui: UiOptions) {
    this.scene = scene;
    this.ui = ui;
    this.local = getLocal(scene);

    this.addStaticTexts();
    this.createTurnSelector();
    this.createExportButton();
    this.createTargetColorSelector();
    this.createToolsSection();
    this.createBlockedTileButton();
  }

  private addStaticTexts() {
    this.addText(60, 110, this.local.game.ui.movesCount);
    this.addText(60, 200, this.local.game.ui.targetColorEditor);
    this.addText(60, 290, this.local.game.ui.tools);
  }

  private addText(x: number, y: number, text: string) {
    this.scene.make.text({
      x,
      y,
      text,
      style: {
        color: "#fff",
        font: "22px OpenSans_Regular",
      },
    });
  }

  private createTurnSelector() {
    new ValueSelector<number>(
      this.scene,
      this.ui.turnsValueSelector.x,
      this.ui.turnsValueSelector.y,
      this.ui.turnsValueSelector.width,
      this.scene.gameStates.turns,
      () => {
        this.scene.gameStates.turns = Math.max(
          1,
          this.scene.gameStates.turns - 1
        );
        return this.scene.gameStates.turns;
      },
      () => {
        this.scene.gameStates.turns = Math.min(
          50,
          this.scene.gameStates.turns + 1
        );
        return this.scene.gameStates.turns;
      }
    );
  }

  private createExportButton() {
    new PrimaryBtn(
      150,
      650,
      this.local.game.ui.export,
      300,
      50,
      this.scene,
      () => this.scene.exportBlock.show()
    );
  }

  private createTargetColorSelector() {
    new ValueSelector<string>(
      this.scene,
      this.ui.targetValueSelector.x,
      this.ui.targetValueSelector.y,
      this.ui.targetValueSelector.width,
      getColorName(this.scene.gameStates.targetColor, this.scene.colors),
      () => this.scene.changeTargetColor(-1),
      () => this.scene.changeTargetColor(1)
    );
  }

  private createToolsSection() {
    const {
      game: { ui },
    } = this.scene.cache.json.get("config") as GameConfig;
    ui.tools.options.forEach((data, index) => {
      this.addText(
        60,
        this.ui.tools.y + this.ui.tools.offset * index - 50,
        this.local.game.tools[data.textKey]
      );

      new ValueSelector<number>(
        this.scene,
        this.ui.tools.x,
        this.ui.tools.y + this.ui.tools.offset * index,
        this.ui.targetValueSelector.width,
        this.scene.gameStates.availableTools[index],
        () => {
          this.scene.gameStates.availableTools[index] = Phaser.Math.Clamp(
            this.scene.gameStates.availableTools[index] - 1,
            0,
            100
          );
          return this.scene.gameStates.availableTools[index];
        },
        () => {
          this.scene.gameStates.availableTools[index] = Phaser.Math.Clamp(
            this.scene.gameStates.availableTools[index] + 1,
            0,
            100
          );
          return this.scene.gameStates.availableTools[index];
        }
      );
    });
  }


  private createBlockedTileButton() {
    const blockedTileBtn = new BaseBtn(
      this.scene,
      0,
      500,
      "blockedTile",
      "blockedTileOver"
    );

    blockedTileBtn.setHotkey("0", ["NUMPAD_ZERO", "ZERO"]);
    blockedTileBtn.setInteractive(() => {
      this.scene.changeSelectedColor(-1);
      this.scene.audioManager.playSFX("colorSelect");
    });
    this.scene.btnContainer.add(blockedTileBtn.container);
  }
}
