import { BaseBlock } from "@/classes/common/BaseBlock";
import { PrimaryBtn } from "@/classes/ui/buttons/PrimaryBtn";
import { OptionFolder } from "@/classes/ui/html/OptionFolder";
import { getLocal } from "@/utils";
import { Scene } from "phaser";
import { SelectedLevelInfo } from "./SelectedLevelInfo";

export class ImportLevel extends BaseBlock {
  viewBox: Phaser.GameObjects.DOMElement;
  applyBtn: PrimaryBtn;

  selectedLevelInfo: SelectedLevelInfo;

  constructor(scene: Scene, selectedLevelInfo?: SelectedLevelInfo) {
    super(0, 0, scene);
    const height = scene.cameras.main.height;

    const { importBlock } = getLocal(scene);
    if (!selectedLevelInfo) {
      this.selectedLevelInfo = new SelectedLevelInfo(
        1500,
        0,
        420,
        height,
        this.applyBtn,
        scene
      );
      this.container.add(this.selectedLevelInfo.container);
    } else {
      this.selectedLevelInfo = selectedLevelInfo;
    }

    this.viewBox = scene.add
      .dom(500, 0, "div", {
        width: `1000px`,
        height: `${height}px`,
        fontSize: "24px",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      })
      .setOrigin(0);
    const textArea = document.createElement("textarea");
    textArea.classList.add("import-block__text");
    textArea.setAttribute("placeholder", "Paste string here");

    const container = document.createElement("div");
    container.classList.add("wrapper");
    container.classList.add("import-block");

    this.viewBox.node.appendChild(container);

    this.applyBtn = new PrimaryBtn(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 + 50,
      importBlock.startBtn,
      350,
      50,
      scene
    );
    this.container.add([this.applyBtn.container, this.viewBox]);

    const folder = new OptionFolder(importBlock.folderName);
    folder.add(textArea);

    textArea.addEventListener("input", () => {
      const levelData = this.parseString(textArea.value);
      if (!levelData) return;
      this.selectedLevelInfo.show();
      this.selectedLevelInfo.updateInfo(levelData);
    });

    container.appendChild(folder.container);

    this.hide();
  }

  parseString(data: string) {
    try {
      const levelData = JSON.parse(atob(data));

      if (!("turns" in levelData) || !("board" in levelData)) return;
      return levelData;
    } catch (error) {
      console.warn("Not correct string");
    }
  }
  hide(): void {
    super.hide();
    const node = this.viewBox.node as HTMLTextAreaElement;
    node.value = "";
    this.selectedLevelInfo.hide();
  }
}
