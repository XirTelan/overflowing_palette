import { Scene } from "phaser";

export class ValueSelector<T> {
  scene: Scene;
  leftButton;
  rightButton;
  container;
  text: Phaser.GameObjects.Text;
  value: T;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    defaultValue: T,
    onLeftClick: () => T,
    onRightClick: () => T
  ) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.value = defaultValue;

    this.leftButton = this.createButton(onLeftClick, {
      x: -width / 2,
      y: 0,
      scale: 0.3,
      angle: 180,
    });
    this.rightButton = this.createButton(onRightClick, {
      x: width / 2,
      y: 0,
      scale: 0.3,
      angle: 0,
    });
    this.text = scene.make
      .text({
        x: 0,
        y: 0,
        text: String(this.value),
        style: {
          color: `#ffffff`,
          font: "20px OpenSans_Regular",
        },
      })
      .setOrigin(0.5, 0.5);
    this.container.add([
      scene.add.rectangle(0, 0, width, 50, 0x1a1b1c, 0.6),
      scene.add.circle(-width / 2, 0, 25, 0x1a1b1c, 0.6),
      scene.add.circle(width / 2, 0, 25, 0x1a1b1c, 0.6),
      this.leftButton,
      this.text,
      this.rightButton,
    ]);
  }
  private createButton(action: () => T, props: BtnProps) {
    const btn = this.scene.add
      .image(props.x, 0, "arrow")
      .setRotation(Phaser.Math.DegToRad(props.angle))
      .setScale(props.scale);
    btn.setInteractive();
    btn.on("pointerdown", () => {
      this.text.setText(String(action()));
    });
    btn.on("pointerover", () => {
      btn.setTint(0xc0b063);
      btn.setScale(0.35);
    });
    btn.on("pointerout", () => {
      btn.clearTint();
      btn.setScale(0.3);
    });
    return btn;
  }
}

type BtnProps = {
  x: number;
  y: number;
  angle: number;
  scale: number;
};
