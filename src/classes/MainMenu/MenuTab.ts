import { Scene } from "phaser";
import { MenuTabProps, Vector2 } from "../../types";

export class MenuTab {
  key: string;
  container: Phaser.GameObjects.Container;
  width: number;
  height: number;
  scene: Scene;
  defaultPos: Vector2;
  actionBtn: Phaser.GameObjects.Image;

  constructor({ key, x, y, scene, width, height }: MenuTabProps) {
    this.scene = scene;
    this.key = key;
    this.container = scene.add.container(x, y);
    this.defaultPos = { x, y };
    this.width = width;
    this.height = height;
    this.container.setVisible(false);

    this.container.add(
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0, 0)
    );
    const mainBtn = scene.add
      .image(width - 250, height, "mainBtn")
      .setOrigin(0.5, 0.5);

    this.actionBtn = mainBtn;

    this.container.add([
      mainBtn,
      scene.make
        .text({
          x: mainBtn.x,
          y: mainBtn.y,
          text: "Launch",
          style: {
            color: "#161616",
            font: "24px OpenSans_Bold",
          },
        })
        .setOrigin(0.5, 0.5),
    ]);
  }
  show() {
    if (this.container.visible) return;
    this.container.setVisible(true);

    this.scene.tweens.add({
      duration: 300,
      targets: this.container,
      x: { from: this.defaultPos.x - 100, to: this.defaultPos.x },
      alpha: { from: 0, to: 1 },
      yoyo: false,
    });
  }
  hide(isForce?: boolean) {
    const before = this.container.x;
    this.scene.tweens.add({
      duration: isForce ? 0 : 300,
      targets: this.container,
      x: { from: this.defaultPos.x, to: this.defaultPos.x - 100 },
      alpha: { from: 1, to: 0 },

      onComplete: () => {
        this.container.setVisible(false);
        this.container.setX(before);
      },
    });
  }
}
