import { Scene } from "phaser";
import { BaseBlock } from "../../common/BaseBlock";
import { InfoBlock } from "./InfoBlock";
import { PreviewBlock } from "./PreviewBlock";
import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { LevelData, GameMode } from "@/types";
import { getConfig, getLocal } from "@/utils";

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

    const selectedLevelInfo =
      getConfig(scene).mainMenu.levelSelection.selectedLevelInfo;

    const { previewBlock } = getLocal(scene);

    this.container.add([
      scene.make
        .text({
          x: width / 2,
          y: 0,
          text: previewBlock.preview,
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
        text: previewBlock.empty,
      })
      .setOrigin(0.5, 0);

    this.previewBlock = new PreviewBlock(10, 60, scene);
    this.levelInfo = new InfoBlock(0, 380, scene);

    this.container.add([
      this.emptyBlock,
      this.levelInfo.container,
      this.previewBlock.container,
    ]);

    if (actionBtn) {
      this.actionBtn = actionBtn;
      actionBtn.container.setPosition(width / 2 + 70, height - 50);
      actionBtn.container.parentContainer.remove(actionBtn.container);
      actionBtn.container.setScale(1);

      this.container.add(actionBtn.container);

      actionBtn.hide();
    }
    this.previewBlock.hide();
    this.levelInfo.hide();
  }
  hide(): void {
    super.hide();
    this.container.setVisible(false);
    this.updateInfo(undefined);
  }
  updateInfo(
    levelData: LevelData | undefined,
    levelKey?: string,
    clearedLevel?: {
      time: string;
    }
  ) {
    if (!levelData) {
      this.actionBtn.hide();
      this.previewBlock.hide();
      this.levelInfo.hide();
      this.emptyBlock.setVisible(true);
      return;
    }
    this.emptyBlock.setVisible(false);
    this.actionBtn.container.setVisible(true);
    this.levelInfo.update(String(levelData.turns), levelData, clearedLevel);
    this.levelInfo.container.setVisible(true);

    this.previewBlock.updatePreview(levelData.board);
    this.previewBlock.container.setVisible(true);

    this.actionBtn.btn.on("pointerup", () => {
      this.scene.time.delayedCall(100, () => {
        this.scene.scene.start("LoadingGame", {
          mode: GameMode.Play,
          levelKey,
          levelData,
        });
      });
    });
  }
}
