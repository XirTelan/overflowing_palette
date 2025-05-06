import { Game } from "@/scenes/Game";
import { UiOptions, GameMode, GameStatus } from "@/types";
import { getLocal } from "@/utils";
import { BaseBtn } from "../../ui/buttons/BaseBtn";

export class PlayerModeUi {
  private scene: Game;
  private ui: UiOptions;

  constructor(scene: Game, ui: UiOptions) {
    this.scene = scene;
    this.ui = ui;

    this.createTurnCounter();
    this.createTargetColorDisplay();
    this.createResetButton();
  }

  private createTurnCounter() {
    const { scene } = this;
    const local = getLocal(scene);

    scene.add.rectangle(50, 100, 230, 40, 0x000000, 0.8).setOrigin(0);

    const label = scene.make.text({
      x: 60,
      y: 110,
      text:
        scene.gameStates.mode === GameMode.Endless
          ? local.game.ui.movesUsed
          : local.game.ui.movesRemain,
      style: {
        color: "#fff",
        font: "22px OpenSans_Regular",
      },
    });

    scene.turnCounter = scene.make.text({
      x: label.x + label.width + 5,
      y: label.y - 5,
      text: `${scene.gameStates.turns}`,
      style: {
        color: "#ffcd3f",
        font: "26px OpenSans_ExtraBold",
      },
    });
  }

  private createTargetColorDisplay() {
    const { scene, ui } = this;
    const local = getLocal(scene);
    const targetKey = scene.gameStates.targetColor;
    const color = scene.colors[targetKey];

    const bg = scene.add
      .rectangle(
        ui.targetUI.x - 100,
        ui.targetUI.y - 10,
        550,
        50,
        0x000000,
        0.8
      )
      .setOrigin(0);

    const label = scene.make.text({
      x: ui.targetUI.x,
      y: ui.targetUI.y,
      text: local.game.ui.targetColor,
      style: {
        color: "#cbcbcc",
        font: "30px OpenSans_Regular",
      },
    });

    const colorText = scene.make.text({
      x: label.x + label.width + 5,
      y: label.y,
      text: this.formatColorName(color.colorName),
      style: {
        color: `rgb(${color.value.x * 255}, ${color.value.y * 255}, ${
          color.value.z * 255
        })`,
        font: "30px OpenSans_Regular",
      },
    });

    bg.displayWidth = label.width + colorText.width + 120;
  }

  private createResetButton() {
    const { scene } = this;
    const local = getLocal(scene);
    const { resetBtn } = scene.cache.json.get("config")["game"]["ui"];

    const btn = new BaseBtn(
      scene,
      scene.btnContainer.x,
      scene.cameras.main.height - 140
    );

    btn.setInteractive(() => {
      if (scene.gameStates.state === GameStatus.Waiting) return;
      scene.resetGame();
    });

    btn.setHotkey("R", "R");
    btn.btnImage.setTexture("uiatlas", "reset");
    (btn.btnOverlay as Phaser.GameObjects.Image).setTexture(
      "uiatlas",
      "reset_over"
    );
    btn.container.setScale(0.8);

    const text = scene.make.text({
      ...resetBtn.text,
      text: local.game.ui.resetBtn,
      x: 0,
      y: 0,
    });

    text.setPosition(text.width, 0);
    btn.hotkeyContainer.add(text);
    btn.hotkeyContainer.setPosition(
      btn.hotkeyContainer.x - 32,
      btn.hotkeyContainer.y + 20
    );
  }

  private formatColorName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
