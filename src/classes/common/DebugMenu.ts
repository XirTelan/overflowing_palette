import { localStoragePrefix } from "@/utils";
import { BaseBlock } from "./BaseBlock";
import { LevelData } from "@/types";

export class DebugMenu extends BaseBlock {
  domContainer: Phaser.GameObjects.DOMElement;
  objectToEdit: {
    mode: number;
    levelData: LevelData;
  };

  private modeInput!: HTMLInputElement;
  private turnsInput!: HTMLInputElement;
  private targetColorInput!: HTMLInputElement;
  private boardInput!: HTMLTextAreaElement;
  private portalsInput!: HTMLTextAreaElement;
  private toolsInputs: HTMLInputElement[] = [];

  private createNumberInput(
    value: number,
    onChange: (newValue: number) => void
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "number";
    input.value = value.toString();
    input.style.padding = "4px";
    input.oninput = (e) =>
      onChange(Number((e.target as HTMLInputElement).value));
    return input;
  }

  private createTextAreaInput<T>(
    value: T,
    onChange: (newValue: T) => void,
    label: string
  ): HTMLTextAreaElement {
    const input = document.createElement("textarea");
    input.value = JSON.stringify(value, null, 2);
    Object.assign(input.style, {
      padding: "4px",
      minHeight: "120px",
      flex: "1",
    });
    input.oninput = (e) => {
      try {
        const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
        onChange(parsed);
      } catch (err) {
        console.error(`Invalid ${label} input:`, err);
      }
    };
    return input;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    Object.assign(btn.style, {
      padding: "4px 10px",
      cursor: "pointer",
    });
    btn.onclick = onClick;
    return btn;
  }

  private createList(): HTMLPreElement {
    const list = document.createElement("pre");
    Object.assign(list.style, {
      border: "1px solid #ccc",
      padding: "10px",
      height: "300px",
      overflow: "auto",
      background: "#f9f9f9",
      fontFamily: "monospace",
    });
    return list;
  }

  private updateList(list: HTMLPreElement): void {
    list.textContent = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      list.textContent += `${key?.padEnd(20)}: ${value}\n`;
    }
  }

  private createWrapper(): HTMLDivElement {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      width: "100%",
      height: "100%",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      color: "#000",
      boxSizing: "border-box",
    });
    return wrapper;
  }

  init() {
    this.objectToEdit = {
      mode: -1,
      levelData: {
        turns: 100,
        board: [[0, -1, 0]],
        tools: [0, 0, 0],
        targetColor: 1,
        portals: [],
      },
    };

    const list = this.createList();

    this.modeInput = this.createNumberInput(this.objectToEdit.mode, (v) => {
      this.objectToEdit.mode = v;
    });

    this.turnsInput = this.createNumberInput(
      this.objectToEdit.levelData.turns,
      (v) => (this.objectToEdit.levelData.turns = v)
    );

    this.targetColorInput = this.createNumberInput(
      this.objectToEdit.levelData.targetColor,
      (v) => (this.objectToEdit.levelData.targetColor = v)
    );

    this.boardInput = this.createTextAreaInput(
      this.objectToEdit.levelData.board,
      (v) => (this.objectToEdit.levelData.board = v),
      "board"
    );

    this.portalsInput = this.createTextAreaInput(
      this.objectToEdit.levelData.portals,
      (v) => (this.objectToEdit.levelData.portals = v),
      "portals"
    );

    const textareasRow = this.createRow(this.boardInput, this.portalsInput);

    const toolsInputs = this.objectToEdit.levelData.tools!.map((value, index) =>
      this.createNumberInput(value, (v) => {
        if (!this.objectToEdit.levelData.tools) {
          this.objectToEdit.levelData.tools = [0, 0, 0];
        }
        this.objectToEdit.levelData.tools[index] = v;
      })
    );

    const toolsRow = this.createRow(...toolsInputs);

    const wrapper = this.createWrapper();
    [
      list,
      this.modeInput,
      this.turnsInput,
      this.targetColorInput,
      toolsRow,
      textareasRow,
      this.createButton("Set", () => {
        localStorage.setItem(
          `${localStoragePrefix}debug`,
          JSON.stringify(this.objectToEdit)
        );
        this.updateList(list);
      }),
      this.createButton("Delete", () => {
        localStorage.removeItem(`${localStoragePrefix}debug`);
        this.updateList(list);
      }),
      this.createButton("Load from Storage", () => this.loadFromLocalStorage()),
    ].forEach((el) => wrapper.appendChild(el));

    this.domContainer = this.scene.add
      .dom(this.container.x, this.container.y, "div", {
        width: "1200px",
        height: "800px",
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0, 0)
      .setDepth(1000)
      .setVisible(true);

    this.domContainer.node.appendChild(wrapper);

    this.scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "D") {
        this.domContainer.setVisible(!this.domContainer.visible);
      }
    });

    this.loadFromLocalStorage();
    this.updateList(list);
    this.hide();
    console.log("DebugMenu initialized");
  }
  private createRow(...elements: HTMLElement[]) {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      gap: "10px",
      flexWrap: "nowrap",
      width: "100%",
    });
    elements.forEach((el) => row.appendChild(el));
    return row;
  }
  hide(): void {
    this.domContainer.setVisible(false);
  }

  loadFromLocalStorage(): void {
    const value = localStorage.getItem(`${localStoragePrefix}debug`);
    if (!value) return;

    try {
      this.objectToEdit = JSON.parse(value);

      this.modeInput.value = this.objectToEdit.mode.toString();
      this.turnsInput.value = this.objectToEdit.levelData.turns.toString();
      this.targetColorInput.value =
        this.objectToEdit.levelData.targetColor.toString();
      this.boardInput.value = JSON.stringify(
        this.objectToEdit.levelData.board,
        null,
        2
      );
      this.portalsInput.value = JSON.stringify(
        this.objectToEdit.levelData.portals ?? [],
        null,
        2
      );

      const tools = this.objectToEdit.levelData.tools ?? [0, 0, 0];
      tools.forEach((value, i) => {
        if (this.toolsInputs[i]) {
          this.toolsInputs[i].value = value.toString();
        }
      });
    } catch (err) {
      console.error("Failed to load debug data:", err);
    }
  }
}
