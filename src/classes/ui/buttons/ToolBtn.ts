import { Game } from "@/scenes/Game";
import { GameConfig, Tools } from "@/types";
import { getLocal } from "@/utils";
import { BaseBtn } from "./BaseBtn";
import { TextBox } from "../textBox";

export class ToolBtn extends BaseBtn {
  scene: Game;

  icon: Phaser.GameObjects.Image;
  currentCountText: Phaser.GameObjects.Text;

  toolKey: Tools;
  localText: string;

  initialCount: number;
  currentCount: number;

  isSelected: boolean = false;
  declare btnOverlay: Phaser.GameObjects.Image;

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
    this.btnImage.setTintFill(0x000000).setAlpha(0.3);
    this.btnOverlay.setTintFill(0x000000).setAlpha(0.3);
    this.icon = scene.make
      .image({ key: textureKey, ...props.props })
      .setScale(0.6)
      .setTintFill(0xffffff)
      .setAlpha(0.8);
    const currentCountText = new TextBox({
      scene: this.scene,
      x: 0,
      y: -55,
      padding: 10,
      style: {
        stroke: "#000000",
        fontSize: "18px",
        fontStyle: "900",
        fontFamily: "Segoe UI, Arial, sans-serif",
        strokeThickness: 2,
      },
      text: `${this.currentCount}/${this.initialCount}`,
      backgroundColor: 0x747b7e,
    });
    this.currentCountText = currentCountText.label;

    this.container.add([this.icon, currentCountText.container]);

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
    this.icon.setTintFill(0xffffff);
    this.setSelected(false);
  }

  update() {
    this.isSelected = this.scene.gameStates.selectedTool === this.toolKey;
    this.setSelected(this.isSelected);
    if (!this.isSelected) this.icon.setTintFill(0xffffff);

    this.currentCountText.setText(`${this.currentCount}/${this.initialCount}`);
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
