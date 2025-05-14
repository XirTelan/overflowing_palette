import { BaseBlock } from "@/classes/common/BaseBlock";
import { Scene } from "phaser";

export class PrimaryBtn extends BaseBlock {
  btn: Phaser.GameObjects.NineSlice;
  text: Phaser.GameObjects.Text;
  overlay: Phaser.GameObjects.NineSlice;

  constructor(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    scene: Scene,
    onClick?: () => void,
    context?: object
  ) {
    super(x, y, scene);

    this.btn = scene.add
      .nineslice(0, 0, "uiatlas", "primary", width, height, 0, 55)
      .setOrigin(0.5, 0.5)
      .setScale(0.7);

    this.overlay = scene.add
      .nineslice(0, 0, "uiatlas", "primary_over", width, height, 0, 0)
      .setOrigin(0.5, 0.5)
      .setScale(0.7);

    this.overlay.setVisible(false);
    this.btn.setInteractive();

    if (onClick) this.btn.on("pointerup", onClick, context);

    this.btn.on("pointerover", this.onEnter, this);
    this.btn.on("pointerout", this.onLeave, this);

    this.text = scene.make
      .text({
        x: this.btn.x,
        y: this.btn.y,
        text: text,
        style: {
          color: "#000000",
          font: "24px OpenSans_Regular",
        },
      })
      .setOrigin(0.5, 0.5);
    this.container.add([this.btn, this.overlay, this.text]);
  }
  onEnter() {
    this.scene.input.setDefaultCursor("pointer");
    this.overlay.setVisible(true);
  }
  onLeave() {
    this.overlay.setVisible(false);
    this.scene.input.setDefaultCursor("default");
  }
}
