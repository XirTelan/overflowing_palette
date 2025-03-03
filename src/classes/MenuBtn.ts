import { Scene } from "phaser";

export class MenuBtn {
  container: Phaser.GameObjects.Container;
  btn: Phaser.GameObjects.Image;
  overlay: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ) {
    const container = scene.add.container(x, y);

    this.btn = scene.add.image(0, 0, "mainMenuBtnMask").setOrigin(0, 0.5);

    this.text = scene.make
      .text({
        x: 20,
        y: 0,
        text,
        style: {
          color: "#a4a4a4",
          font: "46px OpenSans_Bold",
        },
      })
      .setOrigin(0, 0.5);

    this.overlay = scene.add
      .image(0, 0, "mainMenuBtnMask2")
      .setOrigin(0, 0.5)
      .setAlpha(0, 1, 0, 1);

    this.overlay.setVisible(false);

    this.btn.setInteractive();
    this.btn.on("pointerdown", onClick, this);
    this.btn.on("pointerover", this.onEnter, this);
    this.btn.on("pointerout", this.onLeave, this);

    container.add(this.btn);
    container.add(this.text);
    container.add(this.overlay);

    this.container = container;
  }
  private onEnter() {
    this.overlay.setVisible(true);
    this.text.setColor("#ffffff");
  }
  private onLeave() {
    this.overlay.setVisible(false);
    this.text.setColor("#a4a4a4");
  }
}
