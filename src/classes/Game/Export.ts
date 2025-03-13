import { Game } from "../../scenes/Game";
import { LevelData } from "../../types";
import { getLocal } from "../../utils";
import { PrimaryBtn } from "../ui/PrimaryBtn";

export class Export {
  viewBox: Phaser.GameObjects.DOMElement;
  copyBtnString: PrimaryBtn;
  copyBtnJson: PrimaryBtn;
  openButton: PrimaryBtn;
  isOpen: boolean;
  scene: Game;

  constructor(scene: Game) {
    const local = getLocal(scene);
    this.openButton = new PrimaryBtn(
      160,
      320,
      local.export,
      250,
      50,
      scene,
      () => this.open()
    );
    this.scene = scene;
  }
  private copyToClipboard(formattedJson: string) {
    navigator.clipboard.writeText(formattedJson);
    this.viewBox.destroy();
    this.copyBtnString.container.destroy();
    this.copyBtnJson.container.destroy();
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

    const local = getLocal(scene);

    const arr = scene.grid.board.map((cell) => {
      return cell.map((cell) => cell.color);
    });
    const jsonData: LevelData = {
      targetColor: scene.gameStates.targetColor,
      turns: scene.gameStates.turns,
      board: arr,
    };
    const formattedJson = JSON.stringify(jsonData, null, "\t");
    const base64 = btoa(JSON.stringify(jsonData, null));

    this.viewBox = scene.add.dom(
      scene.cameras.main.width / 2 - 8,
      scene.cameras.main.height / 2 - 100,
      "pre",
      {
        width: "800px",
        height: "800px",
        background: "#121212",
        fontSize: "24px",
        padding: "10px",
        overflow: "auto",
      }
    );

    this.copyBtnJson = new PrimaryBtn(
      scene.cameras.main.width / 2 + 200,
      920,
      local.copyJson,
      400,
      50,
      scene,
      () => {
        this.copyToClipboard(formattedJson);
        this.isOpen = false;
      }
    );

    this.copyBtnString = new PrimaryBtn(
      scene.cameras.main.width / 2 - 200,
      920,
      local.copyString,
      400,
      50,
      scene,
      () => {
        this.copyToClipboard(base64);
        this.isOpen = false;
      }
    );
    this.copyBtnJson.container.setScale(1.4);
    this.copyBtnString.container.setScale(1.4);

    this.viewBox.setText(`${base64} \n\n ${formattedJson}`);
  }
}
