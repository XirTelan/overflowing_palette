export class BaseBtn {
  scene: Phaser.Scene;
  btnImage: Phaser.GameObjects.Image;
  btnOverlay: Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Visible;

  container: Phaser.GameObjects.Container;
  private registeredKeys: Phaser.Input.Keyboard.Key[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = "btnRound",
    overlayTexture = "btnRoundOver"
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    this.btnImage = scene.add.image(0, 0, texture);
    this.btnOverlay = scene.add.image(0, 0, overlayTexture);
    this.btnOverlay.setVisible(false);

    this.container.add([this.btnImage, this.btnOverlay]);
  }

  setInteractive(onClick: () => void, isEnabled: () => boolean = () => true) {
    this.btnImage.setInteractive();

    this.btnImage.on("pointerup", () => {
      if (isEnabled()) onClick();
    });

    this.btnImage.on("pointerover", () => {
      if (isEnabled()) this.btnOverlay.setVisible(true);
    });

    this.btnImage.on("pointerout", () => {
      if (!this.btnImage.input?.enabled) return;
      this.btnOverlay.setVisible(false);
    });
  }

  setHotkey(label: string, keys: string | string[], action?: () => void) {
    const hotkeyBg = this.scene.make.image({
      x: 0,
      y: this.btnImage.y + this.btnImage.height / 2,
      key: "uiatlas",
      frame: "hotkey_btn",
      scale: 0.25,
    });

    const hotkeyText = this.scene.make
      .text({
        x: hotkeyBg.x,
        y: hotkeyBg.y,
        text: label,
        style: {
          color: "#3e3e3e",
          font: "20px OpenSans_Bold",
        },
      })
      .setOrigin(0.5);

    const keyList = Array.isArray(keys) ? keys : [keys];
    keyList.forEach((key) => {
      const keyObj = this.scene.input.keyboard?.addKey(key);
      const handler = action || (() => this.btnImage.emit("pointerup"));

      if (keyObj) {
        keyObj.on("down", handler, this);
        this.registeredKeys.push(keyObj);
      }
    });

    this.container.add([hotkeyBg, hotkeyText]);

    this.container.once(Phaser.GameObjects.Events.DESTROY, () =>
      this.cleanupKeys()
    );
  }
  
  private cleanupKeys(): void {
    this.registeredKeys.forEach((key) => {
      this.scene.input?.keyboard?.removeKey(key, true, true);
    });
    this.registeredKeys = [];
  }

  setSelected(selected: boolean, tint?: number) {
    this.btnOverlay.setVisible(selected);
    if (!tint) {
      selected ? this.btnImage.setTintFill(tint) : this.btnImage.clearTint();
    }
  }
}
