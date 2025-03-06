import { Scene } from "phaser";

export class BaseBlock {
  scene: Scene;
  container: Phaser.GameObjects.Container;
  constructor(x: number, y: number, scene: Scene) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }
  hide() {
    this.container.setVisible(false);
  }
  show() {
    this.container.setVisible(true);
  }
}
