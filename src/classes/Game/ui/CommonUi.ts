import { ColorBtn } from "@/classes/ui/buttons/ColorBtn";
import { ToolBtn } from "@/classes/ui/buttons/ToolBtn";
import { Game } from "@/scenes/Game";
import { GameMode, UiOptions } from "@/types";
import { FADE_DELAY, getConfig, getLocal } from "@/utils";

export class CommonUi {
  scene: Game;
  ui: UiOptions;

  constructor(scene: Game) {
    this.scene = scene;
    this.ui = getConfig(scene).game.ui;

    const local = getLocal(scene);

    if (
      scene.gameStates.mode !== GameMode.Editor &&
      scene.gameStates.availableTools
    ) {
      this.createToolButtons();
    }

    this.createColorButtons();
    this.createCloseButton();
    this.createTriangles();

    scene.time.delayedCall(50, () => {
      this.createTitle(local.game.ui.mode);
    });
  }

  private createCloseButton() {
    const { scene, ui } = this;
    const btnCfg = ui.closeBtn;

    const closeBtn = scene.add
      .image(
        scene.cameras.main.width - btnCfg.offset.x,
        btnCfg.offset.y,
        "uiatlas",
        "close"
      )
      .setScale(btnCfg.scale)
      .setInteractive();

    closeBtn.on("pointerup", () => {
      scene.cameras.main.fadeOut(FADE_DELAY, 0, 0, 0);
      scene.time.delayedCall(FADE_DELAY, () => scene.scene.start("MainMenu"));
    });

    closeBtn.on("pointerover", () => closeBtn.setScale(btnCfg.scale + 0.1));
    closeBtn.on("pointerout", () => closeBtn.setScale(btnCfg.scale));
  }

  private createColorButtons() {
    const { scene } = this;
    const { colorButtons: btnCfg } = this.ui;
    const { colors } = getConfig(scene);

    const cellSize = btnCfg.size;
    const isEditor = scene.gameStates.mode === GameMode.Editor;

    scene.gameStates.availableColors.add(scene.gameStates.targetColor);

    const availableColors = Object.entries(colors).filter(
      ([type]) => isEditor || scene.gameStates.availableColors.has(Number(type))
    );

    availableColors.forEach(([type, { value }], i) => {
      const colorId = Number(type);
      const row = i % 4;
      const colOffset = i >= 4 ? cellSize + btnCfg.gap * 2 : 0;
      const y = row * (cellSize + btnCfg.gap);

      const btn = new ColorBtn(
        scene,
        colOffset,
        y,
        cellSize,
        [colorId, value],
        i + 1,
        scene.btnContainer
      );

      scene.colorSelectionButtons.push(btn);
    });

    scene.btnContainer.y -= (scene.colorSelectionButtons.length * cellSize) / 4;
  }

  private createToolButtons() {
    const { scene } = this;
    const toolsCfg = this.ui.tools;

    let toolIndex = 0;
    scene.gameStates.availableTools?.forEach((count, index) => {
      if (count === 0) return;

      const btn = new ToolBtn(
        scene,
        toolsCfg.x,
        toolsCfg.y + toolIndex * toolsCfg.offset,
        count,
        toolsCfg.options[index].hotkey,
        index
      );

      scene.toolsButtons.push(btn);
      toolIndex++;
    });
  }

  private createTitle(mode: string) {
    const { scene } = this;

    const icon = scene.add
      .image(60, 50, "uiatlas", "icon")
      .setScale(0.5)
      .setOrigin(0);

    scene.make.text({
      x: icon.x + 50,
      y: icon.y,
      text: `Overflowing Palette${
        scene.gameStates.mode === GameMode.Editor ? ` | ${mode}` : ""
      }`,
      style: {
        color: "#ab9c6b",
        font: "26px OpenSans_Bold",
      },
    });
  }

  private createTriangles() {
    const { scene } = this;
    const { targetUI } = this.ui;

    const whiteTriangle = [0, 30, -20, 0, 20, 0];
    const goldTriangle = [80, 0, 25, -15, 0, 15, 0, 0x94844c];
    const grayTriangle = [0, -20, -10, 0, 10, 0, 0xffffff, 0.2];

    scene.add.triangle(
      targetUI.x - 45,
      targetUI.y + 15,
      ...whiteTriangle,
      0xffffff
    );
    scene.add.triangle(
      targetUI.x - 5,
      targetUI.y + 15,
      ...whiteTriangle,
      0x94844c
    );
    scene.add.triangle(scene.btnContainer.x - 10, ...goldTriangle);
    scene.add.triangle(scene.btnContainer.x + 20, ...goldTriangle);
    scene.add.triangle(
      scene.btnContainer.x + 10,
      scene.cameras.main.height - 240,
      ...grayTriangle
    );
    scene.add.triangle(
      scene.btnContainer.x + 10,
      scene.cameras.main.height - 220,
      ...grayTriangle
    );
  }
}
