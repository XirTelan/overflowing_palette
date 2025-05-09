import { BaseBtn } from "@/classes/ui/buttons/BaseBtn";
import { Game } from "@/scenes/Game";
import { Position } from "@/types";
import { BaseCellEditor } from "./BaseCellEditor";
import { PortalEditor } from "./PortalEditor";
import { TimedCellEditor } from "./TimedCellEditor";

type EditorKey = "portal" | "timed";

export class EditorManager {
  scene: Game;
  editors: Record<EditorKey, BaseCellEditor>;
  activeEditorKey: EditorKey = "portal";
  openerBtn: BaseBtn;
  modeSwitcher: Phaser.GameObjects.DOMElement;
  container: Phaser.GameObjects.Container;

  constructor(scene: Game) {
    this.scene = scene;

    this.editors = {
      portal: new PortalEditor(scene, this),
      timed: new TimedCellEditor(scene, this),
    };

    this.container = scene.add.container(0, 0).setVisible(false);

    this.createOpener();
    this.createModeSwitcher();

    this.container.add(this.modeSwitcher);
    this.showEditor(this.activeEditorKey);
  }

  private createOpener() {
    const y = this.scene.cameras.main.height - 140;
    const btn = new BaseBtn(this.scene, this.scene.btnContainer.x, y);
    btn.container.setScale(0.8);

    const texture = this.scene.add
      .image(0, 0, "portalMask")
      .setTintFill(0x000000)
      .setScale(1.4);

    btn.container.add(texture);
    btn.setInteractive(() => this.toggleEditorUI());
    btn.setHotkey("E", "E");

    this.openerBtn = btn;
  }

  private createModeSwitcher() {
    const html = `
      <div class="card tab-wrapper">
        <div id="portalTab" class="tab">Portal</div>
        <div id="timedTab" class="tab">Timed</div>
      </div>
    `;

    this.modeSwitcher = this.scene.add
      .dom(this.scene.cameras.main.width / 2, 60)
      .createFromHTML(html);

    ["portal", "timed"].forEach((key) => {
      const tab = this.modeSwitcher.getChildByID(`${key}Tab`);
      tab?.addEventListener("click", () =>
        this.switchToEditor(key as EditorKey)
      );
    });

    this.updateTabClasses(this.activeEditorKey);
  }

  private switchToEditor(editorKey: EditorKey) {
    this.showEditor(editorKey);
    this.updateTabClasses(editorKey);
  }

  private updateTabClasses(activeKey: EditorKey) {
    ["portal", "timed"].forEach((key) => {
      const tab = this.modeSwitcher.getChildByID(`${key}Tab`);
      tab?.classList.toggle("active", key === activeKey);
    });
  }

  private toggleEditorUI() {
    const isVisible = !this.container.visible;
    this.container.setVisible(isVisible);

    Object.values(this.editors).forEach((editor) => {
      editor.container.setVisible(false);
    });

    if (isVisible) {
      this.showEditor(this.activeEditorKey);
    }
  }

  private showEditor(key: EditorKey) {
    this.activeEditorKey = key;
    Object.entries(this.editors).forEach(([k, editor]) => {
      editor.container.setVisible(k === key && this.container.visible);
    });
  }

  getValues(key: EditorKey) {
    return this.editors[key]?.getValues() ?? [];
  }

  isCellAvailable(pos: Position): boolean {
    return !Object.entries(this.editors).some(([key, editor]) => {
      return (
        key !== this.activeEditorKey && editor.isCellAvailable?.(pos[0], pos[1])
      );
    });
  }
}
