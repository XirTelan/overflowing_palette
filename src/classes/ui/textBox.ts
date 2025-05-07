import Phaser from "phaser";

export interface TextBoxOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  style: Phaser.Types.GameObjects.Text.TextStyle;
  padding?: number;
  radius?: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  borderColor?: number;
  borderThickness?: number;
  key?: string;
}

export class TextBox {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;

  constructor(options: TextBoxOptions) {
    const {
      scene,
      x,
      y,
      text,
      style,
      padding = 20,
      radius = 15,
      backgroundColor = 0x000000,
      backgroundAlpha = 1,
      borderColor = 0xffffff,
      borderThickness = 0,
    } = options;

    const label = scene.add
      .text(0, 0, text, {
        ...style,
      })
      .setOrigin(0.5);

    const width = label.width + padding * 2;
    const height = label.height + padding;

    const textureKey =
      options.key ??
      `textbox-${width}x${height}-${backgroundColor}-${borderColor}-${borderThickness}`;

    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(backgroundColor, backgroundAlpha);
      if (borderThickness > 0) {
        graphics.lineStyle(borderThickness, borderColor);
        graphics.strokeRoundedRect(0, 0, width, height, radius);
      }
      graphics.fillRoundedRect(0, 0, width, height, radius);
      graphics.generateTexture(textureKey, width, height);
      graphics.destroy();
    }

    const background = scene.add.image(0, 0, textureKey).setOrigin(0.5);
    const container = scene.add.container(x, y, [background, label]);

    this.container = container;
    this.background = background;
    this.label = label;
  }

  setText(newText: string) {
    this.label.setText(newText);
    return this;
  }

  setVisible(visible: boolean) {
    this.container.setVisible(visible);
    return this;
  }

  destroy() {
    this.container.destroy();
  }
}
