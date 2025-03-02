import { Game } from "../scenes/Game";
import { ColorType, Vector3 } from "../types";

const keysMap = {
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
    hotkey: number,
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
    const hotkeyBtn = this.scene.make.image({
      x,
      y: y + btnSize / 2,
      key: "hotkey_btn",
      scale: 0.1,
    });

    const hotkeyText = this.scene.make
      .text({
        x,
        y: hotkeyBtn.y,
        text: `${hotkey}`,
        style: {
          color: "#3e3e3e",
          font: "20px OpenSans_Bold",
        },
      })
      .setOrigin(0.5, 0.5);

    if (container) {
      container.add(active);
      container.add(btn);
      container.add(hotkeyBtn);
      container.add(hotkeyText);
      container.add(pointer);
    }

    btn.setUniform("color.value", color[1]);
    btn.setUniform("radius.value", 0.5);
    btn.setChannel0("celltexture");

    btn.setInteractive();
    btn.on("pointerdown", this.onClick, this);
    btn.on("pointerover", this.onEnter, this);
    btn.on("pointerout", this.onLeave, this);

    const keyObj = this.scene.input.keyboard?.addKeys(
      keysMap[hotkey as keyof typeof keysMap]
    ) as Record<string, Phaser.Input.Keyboard.Key> | undefined;

    if (keyObj) {
      for (const key of Object.keys(keyObj)) {
        keyObj[key].on("down", () => this.onClick());
      }
    }

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
