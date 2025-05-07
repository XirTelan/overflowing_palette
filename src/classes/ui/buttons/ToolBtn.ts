import { Game } from "@/scenes/Game";
import { GameConfig, Tools } from "@/types";
import { getLocal } from "@/utils";
import { BaseBtn } from "./BaseBtn";

export class ToolBtn extends BaseBtn {
  scene: Game;

  icon: Phaser.GameObjects.Image;
  currentCountText: Phaser.GameObjects.Text;

  toolKey: Tools;
  localText: string;

  initialCount: number;
  currentCount: number;

  isSelected: boolean = false;

  constructor(
    scene: Game,
    x: number,
    y: number,
    count: number,
    hotkey: string,
    toolKey: Tools
  ) {
    super(scene, x, y);

    const {
      game: { ui },
    } = getLocal(scene);

    const {
      game: {
        ui: { tools },
      },
    } = scene.cache.json.get("config") as GameConfig;

    this.scene = scene;
    this.toolKey = toolKey;
    this.localText = ui.toolUses;
    this.initialCount = count;
    this.currentCount = count;
    const { textureKey, ...props } = tools.options[toolKey];

    this.icon = scene.make
      .image({ key: textureKey, ...props })
      .setScale(0.6)
      .setAlpha(0.8);

    this.currentCountText = scene.make
      .text({
        x: 0,
        y: -80,
        text: `${this.localText}: ${this.currentCount}`,
        style: { font: "24px OpenSans_ExtraBold" },
      })
      .setOrigin(0.5)
      .setScale(1.2);

    this.container.add([this.icon, this.currentCountText]);

    this.setInteractive(
      () => this.onClick(),
      () => this.currentCount > 0
    );
    this.container.setScale(0.8);
    this.setHotkey(hotkey, hotkey);
  }

  onClick() {
    if (this.scene.grid.activeSwap) {
      this.scene.grid.activeSwap.cancelSwapSelection();
      this.scene.changeSelectedTool(Tools.none);
      return;
    }

    if (this.currentCount === 0) return;

    this.isSelected ? this.deselect() : this.select();
  }

  select() {
    this.scene.audioManager.playSFX("colorSelect");
    this.scene.changeSelectedTool(this.toolKey);
    this.isSelected = true;
    this.icon.setTintFill(0xffcd3f);
    this.setSelected(true);
  }

  deselect() {
    this.scene.audioManager.playSFX("colorSelect", { detune: 100 });
    this.scene.changeSelectedTool(Tools.none);
    this.isSelected = false;
    this.icon.clearTint();
    this.setSelected(false);
  }

  update() {
    this.isSelected = this.scene.gameStates.selectedTool === this.toolKey;
    this.setSelected(this.isSelected);
    if (!this.isSelected) this.icon.clearTint();

    this.currentCountText.setText(`${this.localText}: ${this.currentCount}`);
  }

  reset() {
    this.currentCount = this.initialCount;
    this.update();
  }

  decrease() {
    this.currentCount--;
    this.update();
  }
}
