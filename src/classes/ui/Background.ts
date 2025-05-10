import { Scene } from "phaser";
import { getConfig } from "@/utils";

export class Background {
  constructor(scene: Scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const { current: background } = getConfig(scene).background;

    const bg = scene.add.shader(
      "distortion",
      width / 2,
      height / 2,
      width,
      height,
      [background.key]
    );
    if (!background) return;
    bg.setUniform("radius.value", background.distortion ? 0.3 : 0.0);
    bg.setUniform("darkOverlay.value", background.overlay ? 0.7 : 0.0);
  }
}
