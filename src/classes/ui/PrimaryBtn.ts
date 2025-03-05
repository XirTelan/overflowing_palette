import { Scene } from "phaser";

export class PrimaryBtn {
  btn: Phaser.GameObjects.NineSlice;
  text: Phaser.GameObjects.Text;
  container: Phaser.GameObjects.Container;
  overlay: Phaser.GameObjects.NineSlice;

  constructor(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    scene: Scene,
    onClick: () => void
  ) {
    const container = scene.add.container(x, y);
    this.container = container;
    this.btn = scene.add
      .nineslice(0, 0, "uiatlas", "primaryBtn", width, height, 157, 55)
      .setOrigin(0.5, 0.5)
      .setScale(0.7);

    this.overlay = scene.add
      .nineslice(0, 0, "uiatlas", "primaryBtn__overlay", width, height, 157, 55)
      .setOrigin(0.5, 0.5)
      .setScale(0.7);

    this.overlay.setVisible(false);
    console.log(this.overlay);
    this.btn.setInteractive();
    this.btn.on("pointerdown", onClick);
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
    container.add([this.btn, this.overlay, this.text]);
  }
  onEnter() {
    console.log("asdasd");
    this.overlay.setVisible(true);
  }
  onLeave() {
    this.overlay.setVisible(false);
  }
}
