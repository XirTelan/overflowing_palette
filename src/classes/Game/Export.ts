import { Game } from "../../scenes/Game";
import { LevelData } from "../../types";
import { PrimaryBtn } from "../ui/PrimaryBtn";

export class Export {
  viewBox: Phaser.GameObjects.DOMElement;
  copyBtn: Phaser.GameObjects.Image;
  openButton: PrimaryBtn;
  isOpen: boolean;
  scene: Game;

  constructor(scene: Game) {
    this.openButton = new PrimaryBtn(160, 320, "Export", 250, 50, scene, () =>
      this.open()
    );
    this.scene = scene;
  }
  private copyToClipboard(formattedJson: string) {
    navigator.clipboard.writeText(formattedJson);
    this.viewBox.destroy();
    this.copyBtn.destroy();
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
  }
  close() {
    this.isOpen = false;
  }
  private render() {
    const scene = this.scene;

    const arr = scene.grid.board.map((cell) => {
      return cell.map((cell) => cell.color);
    });
    const jsonData: LevelData = {
      targetColor: scene.gameStates.targetColor,
      turns: scene.gameStates.turns,
      board: arr,
    };
    const formattedJson = JSON.stringify(jsonData, null, "\t");
    const base64 = btoa(formattedJson)
    
    this.viewBox = scene.add.dom(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 - 100,
      "pre",
      {
        width: "1024px",
        height: "768px",
        background: "#121212",
        fontSize: "24px",
        padding: "10px",
        overflow: "auto",
      }
    );

    const copyBtn = scene.add
      .image(scene.cameras.main.width / 2, 900, "uiatlas", "primaryBtn")
      .setOrigin(0.5, 0.5)
      .setScale(0.8);
    copyBtn.setInteractive();
    copyBtn.on("pointerdown", () => {
      this.copyToClipboard(formattedJson);
      this.isOpen = false;
    });
    scene.make
      .text({
        x: copyBtn.x,
        y: copyBtn.y,
        text: "Copy to clipboard",
        style: {
          color: "#000",
          font: "24px OpenSans_Regular",
        },
      })
      .setOrigin(0.5, 0.5);
    this.copyBtn = copyBtn;
    this.viewBox.setText(formattedJson);
  }
}
