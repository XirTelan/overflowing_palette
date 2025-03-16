import { Game } from "../../scenes/Game";
import { Tools } from "../../types";
import { availableTools } from "../../utils";

export class ToolBtn {
  scene: Game;
  container: Phaser.GameObjects.Container;

  btnOverlay: Phaser.GameObjects.Image;
  icon: Phaser.GameObjects.Image;

  initialCount: number;
  currentCount: number;

  currentCountText: Phaser.GameObjects.Text;

  isSelected: boolean = false;
  toolKey: Tools;

  constructor(
    scene: Game,
    x: number,
    y: number,
    count: number,
    hotkey: string,
    toolKey: Tools
  ) {
    this.scene = scene;
    this.toolKey = toolKey;

    this.initialCount = count;
    this.currentCount = count;

    this.container = scene.add.container(x, y);

    const btnImage = scene.add.image(0, 0, "btnRound").setScale(0.8);

    const btnOverlay = scene.add.image(0, 0, "btnRoundOver").setScale(0.8);
    btnOverlay.setVisible(false);
    this.btnOverlay = btnOverlay;

    const hotkeyBtn = scene.make.image({
      key: "uiatlas",
      frame: "hotkey_btn",
      scale: 0.3,
      y: btnImage.y + 50,
    });

    const { textureKey, props } =
      availableTools[toolKey as keyof typeof availableTools];

    this.icon = scene.make
      .image({
        rotation: 0,
        key: textureKey,
        ...props,
      })
      .setScale(0.6)
      .setAlpha(0.8);

    const hotkeyText = scene.make
      .text({
        text: hotkey,
        style: {
          color: "#3e3e3e",
          font: "24px OpenSans_Bold",
        },
        x: hotkeyBtn.x,
        y: hotkeyBtn.y,
      })
      .setOrigin(0.5);

    this.currentCountText = scene.make
      .text({
        x: 0,
        y: -65,
        text: `Uses: ${this.currentCount}`,
        style: {
          font: `24px OpenSans_ExtraBold`,
        },
      })
      .setOrigin(0.5);

    const keyObj = scene.input.keyboard?.addKey(hotkey);
    if (keyObj) keyObj.on("down", this.onClick, this);

    btnImage.setInteractive();
    btnImage.on("pointerdown", this.onClick, this);
    btnImage.on("pointerover", () => {
      if (this.currentCount == 0) return;
      btnOverlay.setVisible(true);
    });
    btnImage.on("pointerout", () => {
      if (!this.isSelected) btnOverlay.setVisible(false);
    });

    this.container.add([
      btnImage,
      btnOverlay,
      this.icon,
      this.currentCountText,
      hotkeyBtn,
      hotkeyText,
    ]);
  }

  onClick() {
    if (this.scene.grid.activeSwap) {
      this.scene.grid.activeSwap.cancelSwapSelection();
      this.scene.changeSelectedTool(Tools.none);
      return;
    }
    if (this.currentCount === 0) return;
    if (this.isSelected) {
      this.deselect();
    } else {
      this.select();
    }
  }
  select() {
    this.scene.sound.play("colorSelect");
    this.scene.changeSelectedTool(this.toolKey);
    this.isSelected = true;
    this.icon.setTintFill(0xffcd3f);
    this.btnOverlay.setVisible(true);
  }
  deselect() {
    this.scene.sound.play("colorSelect", { detune: 100 });
    this.scene.changeSelectedTool(Tools.none);
    this.isSelected = false;
    this.icon.clearTint();
    this.btnOverlay.setVisible(false);
  }
  update() {
    if (this.scene.gameStates.selectedTool === this.toolKey) {
      this.isSelected = true;
      this.btnOverlay.setVisible(true);
    } else {
      this.isSelected = false;
      this.icon.clearTint();
      this.btnOverlay.setVisible(false);
    }
    this.currentCountText.setText(`Uses: ${this.currentCount}`);
  }
  reset() {
    this.currentCount = this.initialCount;
    this.update();
  }
  decrease() {
    this.currentCount--;
    this.update();
  }
}
