import { Scene } from "phaser";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { BaseBlock } from "../../common/BaseBlock";
import { SelectedLevelInfo } from "./SelectedLevelInfo";
import { OptionFolder } from "../../ui/html/OptionFolder";

export class ImportLevel extends BaseBlock {
  viewBox: Phaser.GameObjects.DOMElement;
  applyBtn: PrimaryBtn;

  previewBlock: SelectedLevelInfo;

  constructor(scene: Scene) {
    super(0, 0, scene);
    const height = scene.cameras.main.height;

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

    const container = document.createElement("div");
    container.classList.add("wrapper");
    container.classList.add("import-block");

    this.viewBox.node.appendChild(container);

    this.applyBtn = new PrimaryBtn(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 + 50,
      "Start",
      350,
      50,
      scene
    );
    this.container.add([this.applyBtn.container, this.viewBox]);

    const folder = new OptionFolder("Import level");
    folder.add(textArea);

    const buttonBlock = document.createElement("div");
    buttonBlock.classList.add("import-block__btns");
    const btn = document.createElement("button");
    btn.classList.add("primary-btn");
    btn.textContent = "Load";
    btn.addEventListener("click", () => {
      const levelData = this.parseString(textArea.value);
      if (!levelData) return;
      this.previewBlock.show();
      this.previewBlock.updateInfo(levelData);
    });

    const btnClose = document.createElement("button");
    btnClose.classList.add("primary-btn");
    btnClose.textContent = "Cancel";
    btnClose.addEventListener("click", () => {
      textArea.value = "";
      this.hide();
    });

    buttonBlock.appendChild(btnClose);
    buttonBlock.appendChild(btn);

    this.previewBlock = new SelectedLevelInfo(
      1500,
      0,
      420,
      height,
      this.applyBtn,
      scene
    );
    container.appendChild(folder.container);
    container.appendChild(buttonBlock);
    this.container.add(this.previewBlock.container);
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
    this.previewBlock.hide();
  }
}
