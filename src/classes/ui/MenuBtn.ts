import { Scene } from "phaser";
import { BaseBlock } from "../common/BaseBlock";

export class MenuBtn extends BaseBlock {
  btn: Phaser.GameObjects.Image;
  overlay: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  isActive: boolean;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ) {
    super(x, y, scene);
    const container = this.container;

    const { menuBtn } = scene.cache.json.get("config")["mainMenu"];
    this.btn = scene.add
      .image(menuBtn.btn.offset, 0, "uiatlas", "menuBtn")
      .setOrigin(0, 0.5);

    this.text = scene.make
      .text({
        ...menuBtn.text,
        text,
      })
      .setOrigin(0, 0.5);
    this.overlay = scene.add
      .image(this.btn.x, this.btn.y, "uiatlas", "menuBtn_overlay")
      .setOrigin(0, 0.5);
    this.overlay.preFX?.addBloom(0xffffff, 1, 1, 1.5);
    this.overlay.setVisible(false);

    this.btn.setInteractive();
    this.btn.on("pointerdown", onClick, this);
    this.btn.on("pointerover", this.onEnter, this);
    this.btn.on("pointerout", this.onLeave, this);

    container.add(this.btn);
    container.add(this.overlay);
    container.add(this.text);

    this.container = container;
  }
  setActive(state: boolean) {
    this.isActive = state;
  }
  private onEnter() {
    this.overlay.setVisible(true);
    this.scene.input.setDefaultCursor("pointer");
    this.text.setColor("#ffffff");
  }
  private onLeave() {
    this.overlay.setVisible(false);
    this.scene.input.setDefaultCursor("default");
    this.text.setColor("#a4a4a4");
  }
}
