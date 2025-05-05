import { Game } from "@/scenes/Game";
import { BaseBtn } from "./BaseBtn";
import { ColorType, Vector3 } from "@/types";

const keysMap = {
  0: "NUMPAD_ZERO,ZERO",
  1: "NUMPAD_ONE,ONE",
  2: "NUMPAD_TWO,TWO",
  3: "NUMPAD_THREE,THREE",
  4: "NUMPAD_FOUR,FOUR",
  5: "NUMPAD_FIVE,FIVE",
  6: "NUMPAD_SIX,SIX",
  7: "NUMPAD_SEVEN,SEVEN",
  8: "NUMPAD_EIGHT,EIGHT",
  9: "NUMPAD_NINE,NINE",
};

export class ColorBtn extends BaseBtn {
  color: [ColorType, Vector3];
  pointer: Phaser.GameObjects.Triangle;
  declare scene: Game;

  constructor(
    scene: Game,
    x: number,
    y: number,
    btnSize: number,
    color: [ColorType, Vector3],
    hotkey: number,
    parentContainer?: Phaser.GameObjects.Container
  ) {
    super(scene, x, y);

    this.container.removeAll(true);

    const activeCircle = scene.add
      .circle(0, 0, btnSize / 2 + 5, 0xf4f4f4)
      .setVisible(false);

    const shaderBtn = scene.add.shader("base", 0, 0, btnSize, btnSize);
    shaderBtn.setUniform("color.value", color[1]);
    shaderBtn.setUniform("radius.value", 0.5);
    shaderBtn.setChannel0("celltexture");

    const pointer = scene.add.triangle(
      btnSize / 2 + 20,
      10,
      -5,
      0,
      10,
      10,
      10,
      -10,
      0xffffff
    );
    pointer.setVisible(false);

    this.container.add([activeCircle, shaderBtn, pointer]);

    const hotkeyStr = keysMap[hotkey as keyof typeof keysMap];
    this.setHotkey(hotkey.toString(), hotkeyStr.split(","), () =>
      shaderBtn.emit("pointerup")
    );

    this.color = color;
    this.pointer = pointer;

    shaderBtn.setInteractive();
    shaderBtn.on("pointerup", this.onClick, this);
    shaderBtn.on("pointerover", this.onEnter, this);
    shaderBtn.on("pointerout", this.onLeave, this);

    scene.tweens.add({
      targets: pointer,
      duration: 1000,
      x: `+=10`,
      yoyo: true,
      repeat: -1,
    });

    if (parentContainer) parentContainer.add(this.container);

    this.btnOverlay = activeCircle;
    this.update();
  }

  onEnter() {
    this.scene.audioManager.playSFX("mouseOver");
    this.btnOverlay.setVisible(true);
  }

  onLeave() {
    if (this.scene.gameStates.selectedColor !== this.color[0]) {
      this.btnOverlay.setVisible(false);
    }
  }

  onClick() {
    this.scene.changeSelectedColor(this.color[0]);
    this.scene.audioManager.playSFX("colorSelect");
  }

  update() {
    const isSelected = this.scene.gameStates.selectedColor === this.color[0];
    this.btnOverlay.setVisible(isSelected);
    this.pointer.setVisible(isSelected);
  }
}
