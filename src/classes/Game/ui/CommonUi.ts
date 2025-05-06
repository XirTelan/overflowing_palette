import { ColorBtn } from "@/classes/ui/buttons/ColorBtn";
import { ToolBtn } from "@/classes/ui/buttons/ToolBtn";
import { Game } from "@/scenes/Game";
import { GameConfig, GameMode, UiOptions } from "@/types";
import { FADE_DELAY, getLocal } from "@/utils";

export class CommonUi {
  scene: Game;
  ui: UiOptions;
  constructor(scene: Game) {
    this.scene = scene;
    const local = getLocal(scene);
    if (
      scene.gameStates.mode != GameMode.Editor &&
      scene.gameStates.availableTools
    ) {
      this.createToolsButtons();
    }
    this.createColorSelectionButtons();
    this.createCloseButton();

    scene.time.delayedCall(50, () => {
      this.createTitle(scene, local.game.ui.mode);
    });

    this.createTriangles();
  }
  createCloseButton() {
    const scene = this.scene;
    const {
      game: { ui },
    } = this.scene.cache.json.get("config");

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

  createColorSelectionButtons() {
    const scene = this.scene;
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
    const available = this.scene.gameStates.availableTools;
    const {
      game: { ui },
    } = this.scene.cache.json.get("config") as GameConfig;
    available?.forEach((toolCount, indx) => {
      if (toolCount == 0) return;
      this.scene.toolsButtons.push(
        new ToolBtn(
          this.scene,
          150,
          600 + count * 160,
          toolCount,
          ui.tools.options[indx].hotkey,
          indx
        )
      );
      count++;
    });
  }

  createTitle(scene: Game, mode: string) {
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

  createTriangles() {
    const scene = this.scene;
    const {
      game: { ui },
    } = scene.cache.json.get("config") as GameConfig;
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
