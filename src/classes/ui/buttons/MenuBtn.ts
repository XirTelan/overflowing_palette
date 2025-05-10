import { AudioManager } from "@/classes/common/AudioManager";
import { BaseBlock } from "@/classes/common/BaseBlock";
import { Scene } from "phaser";

export class MenuBtn extends BaseBlock {
  audioManager: AudioManager;
  btn: Phaser.GameObjects.Image;
  overlay: Phaser.GameObjects.Image;
  active: Phaser.GameObjects.Container;
  text: Phaser.GameObjects.Text;
  key: string;

  tweenAnimation: Phaser.Tweens.Tween;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    tabKey: string,
    onClick: () => void
  ) {
    super(x, y, scene);
    const container = this.container;
    this.key = tabKey;

    const { menuBtn } = scene.cache.json.get("config")["mainMenu"];

    const active = scene.add.container(0, 0);
    this.active = active;
    const activeCircle = scene.add
      .image(-50, 0, "MainBtnActiveCircle")
      .setOrigin(0.5, 0.5)
      .setScale(0.8);

    const activeImg = scene.add
      .image(menuBtn.btn.offset, 0, "MainBtnActive")
      .setOrigin(0, 0.5);

    active.add([activeCircle, activeImg]);

    this.btn = scene.add
      .image(menuBtn.btn.offset, 0, "uiatlas", "menuBtn")
      .setOrigin(0, 0.5);

    this.text = scene.make
      .text({
        ...menuBtn.text,
        text,
      })
      .setFixedSize(275, 60)
      .setOrigin(0, 0.5);
    this.overlay = scene.add
      .image(this.btn.x, this.btn.y, "uiatlas", "menuBtn_overlay")
      .setOrigin(0, 0.5);
    this.overlay.preFX?.addBloom(0xffffff, 1, 1, 1.5);
    this.overlay.setVisible(false);

    this.btn.setInteractive();
    this.btn.on("pointerup", onClick, this);
    this.btn.on("pointerup", this.onClick, this);
    this.btn.on("pointerover", this.onEnter, this);
    this.btn.on("pointerout", this.onLeave, this);

    this.tweenAnimation = this.scene.tweens.add({
      targets: activeCircle,
      angle: 360,
      repeat: -1,
      duration: 50000,
    });

    container.add([this.btn, this.overlay, active, this.text]);

    this.active.setVisible(false);
    this.container.setVisible(false);

    this.audioManager = this.scene.registry.get("audioManager") as AudioManager;

    //delay to make sure fonts is ready since any other mehod doesnt worked
    this.scene.time.delayedCall(50, () => {
      this.text.updateText();
      this.container.setVisible(true);
    });
    this.container = container;
  }

  update(isActive: boolean) {
    if (isActive) {
      this.active.setVisible(true);
      this.text.setTintFill(0x000000);
      this.tweenAnimation.resume();
    } else {
      this.active.setVisible(false);
      this.text.clearTint();
      this.tweenAnimation.pause();
    }
  }

  private onClick() {
    this.audioManager?.playSFX("btnClick");
  }

  private onEnter() {
    this.overlay.setVisible(true);
    this.scene.input.setDefaultCursor("pointer");
    this.text.setColor("#ffffff");
    this.audioManager?.playSFX("btnClick", { detune: 100, volume: 0.5, });
  }
  private onLeave() {
    this.overlay.setVisible(false);
    this.scene.input.setDefaultCursor("default");
    this.text.setColor("#a4a4a4");
  }
}
