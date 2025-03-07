import { Scene } from "phaser";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { BaseBlock } from "../../common/BaseBlock";

export class ImportLevel extends BaseBlock {
  viewBox: Phaser.GameObjects.DOMElement;
  applyBtn: PrimaryBtn;
  constructor(scene: Scene) {
    super(0, 0, scene);
  }

  render() {
    const scene = this.scene;

    this.viewBox = scene.add.dom(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 - 100,
      "TextArea",
      {
        width: "500px",
        height: "200px",
        background: "#121212",
        fontSize: "24px",
        padding: "10px",
        overflow: "auto",
      }
    );

    this.applyBtn = new PrimaryBtn(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2 + 50,
      "Apply",
      600,
      50,
      scene,
      () => {
        const node = this.viewBox.node as HTMLTextAreaElement;
        console.log(node.value);
        this.parseString(node.value);
      }
    );

    this.applyBtn.container.setScale(1.2);
    this.container.add([this.applyBtn.container, this.viewBox]);
  }
  parseString(data: string) {
    try {
      const levelData = JSON.parse(atob(data));
      console.log("levelData", levelData);

      if (!("turns" in levelData) || !("board" in levelData)) return;
      this.scene.scene.start("LoadingGame", { mode: "Play", levelData });
    } catch (error) {
      console.error("catch");
      this.hide();
    }
  }
  hide(): void {
    super.hide();
    const node = this.viewBox.node as HTMLTextAreaElement;
    node.value = "";
  }
}
