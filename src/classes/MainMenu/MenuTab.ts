import { Scene } from "phaser";
import { MenuTabProps, Vector2 } from "../../types";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { BaseBlock } from "../common/BaseBlock";

export class MenuTab extends BaseBlock {
  key: string;
  content: Phaser.GameObjects.Container;
  width: number;
  height: number;
  defaultPos: Vector2;
  actionBtn: PrimaryBtn;

  constructor({ key, x, y, scene, width, height }: MenuTabProps) {
    super(x, y, scene);

    this.key = key;
    this.content = scene.add.container(0, 0);
    this.defaultPos = { x, y };
    this.width = width;
    this.height = height;

    this.container.setVisible(false);

    this.container.add(this.content);

    this.container.add(
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0, 0)
    );
    const mask = scene.add
      .rectangle(x, y, width, height, 0xffffff)
      .setOrigin(0, 0)
      .setVisible(false)
      .createGeometryMask();

    this.content.setMask(mask);

    this.actionBtn = new PrimaryBtn(
      width - 180,
      height + 50,
      "Start",
      350,
      0,
      scene
    );
    this.actionBtn.container.setScale(1.5);
    this.container.add(this.actionBtn.container);
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
