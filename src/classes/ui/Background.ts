import { Scene } from "phaser";
import { GameConfig } from "../../types";

export class Background {
  constructor(scene: Scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const { current: background } = scene.cache.json.get("config")[
      "background"
    ] as GameConfig["background"];

    const bg = scene.add.shader(
      "distortion",
      width / 2,
      height / 2,
      width,
      height,
      [background.key]
    );
    console.log(background);
    if (!background) return;
    console.log("background", background);
    bg.setUniform("radius.value", background.distortion ? 0.3 : 0.0);
    bg.setUniform("darkOverlay.value", background.overlay ? 0.7 : 0.0);
  }
}
