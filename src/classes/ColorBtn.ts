import { Game } from "../scenes/Game";
import { ColorType, Vector3 } from "../types";

export default class ColorBtn {
  scene: Game;
  gameObject: Phaser.GameObjects.Shader;
  color;
  active;
  pointer;

  constructor(
    scene: Game,
    x: number,
    y: number,
    btnSize: number,
    color: [ColorType, Vector3],
    container?: Phaser.GameObjects.Container
  ) {
    this.scene = scene;
    const pointer = this.scene.add.triangle(
      60,
      10,
      x - 5,
      y,
      x + 10,
      y + 10,
      x + 10,
      y - 10,
      0xffffff
    );
    const active = this.scene.add
      .circle(x, y, btnSize / 2 + 5, 0xf4f4f4)
      .setVisible(false);
    this.active = active;
    const btn = this.scene.add.shader("base", x, y, btnSize, btnSize);

    if (container) {
      container.add(active);
      container.add(btn);
      container.add(pointer);
    }

    var uniform = btn.getUniform("iChannel0");
    console.log("uniform", uniform);
    btn.setUniform("color.value", color[1]);
    btn.setUniform("radius.value", 0.5);
    btn.setChannel0("celltexture");
    btn.setInteractive();
    btn.on("pointerdown", this.onClick, this);
    btn.on("pointerover", this.onEnter, this);
    btn.on("pointerout", this.onLeave, this);

    this.scene.tweens.add({
      targets: pointer,
      duration: 1000,
      x: `+=10`,
      yoyo: true,
      repeat: -1,
    });

    this.color = color;
    this.gameObject = btn;
    this.pointer = pointer;
    this.update();
  }
  onEnter() {
    this.scene.sound.play("mouseOver");
    this.active.setVisible(true);
  }
  onLeave() {
    if (Number(this.scene.gameStates.selectedColor) != Number(this.color[0]))
      this.active.setVisible(false);
  }
  update() {
    console.log(
      "update",
      this.scene.gameStates.selectedColor,
      this.color[0],
      this.active,
      this.scene.gameStates.selectedColor == this.color[0]
    );
    if (Number(this.scene.gameStates.selectedColor) === Number(this.color[0])) {
      this.active.setVisible(true);
      this.pointer.setVisible(true);
    } else {
      this.active.setVisible(false);
      this.pointer.setVisible(false);
    }
  }
  onClick() {
    this.scene.changeSelectedColor(this.color[0]);
    this.scene.sound.play("colorSelect");
  }
}
