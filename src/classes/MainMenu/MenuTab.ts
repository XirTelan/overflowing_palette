import { MenuTabProps, Vector2 } from "../../types";
import { BaseBlock } from "../common/BaseBlock";
import { FADE_DELAY, getLocal } from "../../utils";
import { PrimaryBtn } from "../ui/buttons/PrimaryBtn";

export class MenuTab extends BaseBlock {
  key: string;
  width: number;
  height: number;
  defaultPos: Vector2;
  actionBtn: PrimaryBtn;
  private viewBox;
  contentContainer: HTMLDivElement;

  constructor({ key, x, y, scene, width, height }: MenuTabProps) {
    super(x, y, scene);

    this.key = key;
    this.defaultPos = { x, y };
    this.width = width;
    this.height = height;

    const { mainMenu } = getLocal(scene);

    this.viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0);

    this.contentContainer = document.createElement("div");
    this.viewBox.node.append(this.contentContainer);

    this.container.setVisible(false);

    this.container.add(
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0, 0)
    );

    const mask = scene.add
      .rectangle(x, y, width, height, 0xffffff)
      .setOrigin(0, 0)
      .setVisible(false)
      .createGeometryMask();

    this.container.setMask(mask);

    this.actionBtn = new PrimaryBtn(
      width - 140,
      height - 50,
      mainMenu.startBtn,
      350,
      0,
      scene
    );
    this.actionBtn.container;
    this.container.add([this.viewBox, this.actionBtn.container]);
  }

  destroy() {
    this.contentContainer.remove();
  }
  show() {
    if (this.container.visible) return;
    this.container.setVisible(true);

    this.scene.tweens.add({
      duration: FADE_DELAY,
      targets: this.container,
      x: { from: this.defaultPos.x - 100, to: this.defaultPos.x },
      alpha: { from: 0, to: 1 },
      yoyo: false,
    });
  }
  hide(isForce?: boolean) {
    const before = this.container.x;
    this.scene.tweens.add({
      duration: isForce ? 0 : FADE_DELAY,
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
