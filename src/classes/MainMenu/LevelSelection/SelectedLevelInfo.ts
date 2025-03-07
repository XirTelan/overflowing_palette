import { Scene } from "phaser";
import { ColorType, LevelData } from "../../../types";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { colors, NormalizedRgbToColor } from "../../../utils";
import { BaseBlock } from "../../common/BaseBlock";

export class SelectedLevelInfo extends BaseBlock {
  previewBlock: PreviewBlock;
  levelInfo: InfoBlock;
  emptyBlock: Phaser.GameObjects.Text;
  actionBtn: PrimaryBtn;
  width: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    actionBtn: PrimaryBtn,
    scene: Scene
  ) {
    super(x, y, scene);

    this.width = width;

    const { selectedLevelInfo } =
      scene.cache.json.get("config")["mainMenu"]["levelSelection"];

    this.container.add([
      scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0, 0),
      scene.add.rectangle(0, 0, width, 45, 0x000000, 1).setOrigin(0, 0),
      scene.make
        .text({
          x: width / 2,
          y: 0,
          text: "Preview",
          style: {
            color: "#fff",
            font: "32px OpenSans_Bold",
          },
        })
        .setOrigin(0.5, 0),
    ]);

    this.emptyBlock = scene.make
      .text({
        ...selectedLevelInfo.emptyText,
        x: width / 2,
      })
      .setOrigin(0.5, 0);

    this.previewBlock = new PreviewBlock(0, 40, scene);
    this.levelInfo = new InfoBlock(20, 40, scene);

    this.container.add([
      this.emptyBlock,
      this.levelInfo.container,
      this.previewBlock.container,
    ]);

    this.actionBtn = actionBtn;
    actionBtn.container.setPosition(width / 2 + 70, height - 50);
    actionBtn.container.parentContainer.remove(actionBtn.container);
    actionBtn.container.setScale(1);



    this.container.add(actionBtn.container);

    actionBtn.hide();
    this.previewBlock.hide();
    this.levelInfo.hide();
  }
  updateInfo(levelData: LevelData | undefined, levelKey?: string) {
    if (!levelData) {
      this.actionBtn.hide();
      this.previewBlock.hide();
      this.levelInfo.hide();
      this.emptyBlock.setVisible(true);
      return;
    }
    this.actionBtn.container.setVisible(true);

    this.levelInfo.update(String(levelData.turns), levelData.targetColor);
    this.levelInfo.container.setVisible(true);

    this.previewBlock.updatePreview(levelData.board);
    this.previewBlock.container.setVisible(true);

    this.actionBtn.btn.on("pointerdown", () => {
      this.scene.scene.start("LoadingGame", {
        mode: "Play",
        levelKey,
        levelData,
      });
    });
    this.emptyBlock.setVisible(false);
  }
}

class PreviewBlock extends BaseBlock {
  graphics: Phaser.GameObjects.Graphics;
  constructor(x: number, y: number, scene: Scene) {
    super(x, y, scene);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);
  }
  updatePreview(level: LevelData["board"]) {
    const { selectedLevelInfo } =
      this.scene.cache.json.get("config")["mainMenu"]["levelSelection"];

    const rows = level.length;
    const cols = level[0].length;

    const originalWidth = cols * selectedLevelInfo.previewBlock.cellSize;
    const originalHeight = rows * selectedLevelInfo.previewBlock.cellSize;

    const scaleX = selectedLevelInfo.previewBlock.width / originalWidth;
    const scaleY = selectedLevelInfo.previewBlock.height / originalHeight;
    const finalScale = Math.min(scaleX, scaleY);

    const graphics = this.graphics;
    console.log(finalScale, originalWidth, originalWidth * finalScale);
    graphics.setScale(finalScale);
    this.container.setPosition(
      (selectedLevelInfo.previewBlock.width - originalWidth * finalScale) / 2,
      this.container.y
    );

    graphics.clear();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const color = colors[level[i][j] as ColorType];
        graphics.fillStyle(NormalizedRgbToColor(color));
        graphics.fillRect(j * 50, i * 50, 50, 50);
      }
    }
  }
}
class InfoBlock extends BaseBlock {
  turnsText: Phaser.GameObjects.Text;
  tartgetColorText: Phaser.GameObjects.Text;
  constructor(x: number, y: number, scene: Scene) {
    super(x, y, scene);

    const { selectedLevelInfo } =
      scene.cache.json.get("config")["mainMenu"]["levelSelection"];

    this.container = scene.add.container(
      selectedLevelInfo.infoBlock.x,
      selectedLevelInfo.infoBlock.y
    );
    this.container.add(
      scene.add
        .rectangle(
          0,
          -10,
          selectedLevelInfo.infoBlock.width,
          selectedLevelInfo.infoBlock.height,
          0x000000,
          1
        )
        .setOrigin(0, 0)
    );

    const staticText = scene.make.text({
      ...selectedLevelInfo.targetColorTextOffset,
      text: "Target color:",
      style: selectedLevelInfo.defaultStyle,
    });

    this.tartgetColorText = scene.make
      .text({
        x:
          selectedLevelInfo.infoBlock.width -
          selectedLevelInfo.targetColorTextOffset.x,
        y: staticText.y,
        text: "No color",
        style: selectedLevelInfo.defaultStyle,
      })
      .setOrigin(1, 0);

    const staticText2 = scene.make.text({
      ...selectedLevelInfo.turnsTextOffset,
      text: "Turns:",
      style: selectedLevelInfo.defaultStyle,
    });

    this.turnsText = scene.make
      .text({
        x:
          selectedLevelInfo.infoBlock.width -
          selectedLevelInfo.turnsTextOffset.x,
        y: staticText2.y,

        text: "0",
        style: { ...selectedLevelInfo.defaultStyle, color: "#ffcd3f" },
      })
      .setOrigin(1, 0);

    this.container.add([
      this.tartgetColorText,
      this.turnsText,
      staticText,
      staticText2,
    ]);
  }
  update(turns: string, color: ColorType) {
    this.tartgetColorText.setText(`${ColorType[color]}`);
    const { x, y, z } = colors[color];
    this.tartgetColorText.setColor(
      Phaser.Display.Color.RGBToString(x * 255, y * 255, z * 255)
    );
    this.turnsText.setText(turns);
  }
}
