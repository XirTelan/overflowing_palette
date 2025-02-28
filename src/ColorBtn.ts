import { Game } from "./scenes/Game";
import { ColorType, Vector3 } from "./types";

export default class ColorBtn {
  scene: Game;
  gameObject: Phaser.GameObjects.Shader;
  color;
  active;

  constructor(
    scene: Game,
    x: number,
    y: number,
    btnSize: number,
    color: [ColorType, Vector3],
    container?: Phaser.GameObjects.Container
  ) {
    this.scene = scene;

    const active = this.scene.add
      .circle(x, y, btnSize / 2 + 5, 0xf4f4f4)
      .setVisible(false);
    this.active = active;
    const btn = this.scene.add.shader("base", x, y, btnSize, btnSize);

    if (container) {
      container.add(active);
      container.add(btn);
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

    this.color = color;
    this.gameObject = btn;
  }
  onEnter() {
    this.active.setVisible(true);
  }
  onLeave() {
    this.active.setVisible(false);
  }
  onClick() {
    this.scene.gameStates.selectedColor = this.color[0];
  }
}
