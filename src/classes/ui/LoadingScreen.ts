import { Scene } from "phaser";

export class LoadingScreen {
  bgShader;
  textShader;
  constructor(scene: Scene) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const bgShader = scene.add
      .shader("loading", 0, 0, width, height, ["celltexture", "cellnoise"])
      .setOrigin(0);

    scene.add
      .tileSprite(0, 0, width, height, "cellMask")
      .setOrigin(0)
      .setTileScale(1.15);

    const props = {
      x: width / 2,
      y: height / 2,
      text: "LOADING",
    };

    scene.make
      .text({
        ...props,
        style: {
          font: "bold 20rem Cinzel",
          stroke: "#000000",
          strokeThickness: 10,
        },
      })
      .setOrigin(0.5);

    const loadingText = scene.make
      .text({
        ...props,
        style: {
          font: "bold 20rem Cinzel",
          color: "#ffffff",
        },
      })
      .setOrigin(0.5);

    const mask = scene.add.bitmapMask(loadingText);
    const textShader = scene.add
      .shader("loading", 0, 0, width, height, ["celltexture", "cellnoise"])
      .setOrigin(0)
      .setMask(mask);

    textShader.setUniform("isSimple.value", 1.0);

    bgShader.setUniform("transition.value", 1.1);
    textShader.setUniform("transition.value", 1.1);

    this.bgShader = bgShader;
    this.textShader = textShader;

    scene.cameras.main.postFX.addVignette(0.5, 0.5, 0.68, 0.5);
  }
}
