import { BaseBlock } from "./BaseBlock";

export class DebugMenu extends BaseBlock {
  domContainer: Phaser.GameObjects.DOMElement;
  blocker: HTMLDivElement;
  objectToEdit: any;

  private createNumberInput(
    value: number,
    onChange: (newValue: number) => void
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "number";
    input.value = value.toString();
    input.style.padding = "4px";
    input.oninput = (e) => {
      onChange(Number((e.target as HTMLInputElement).value));
    };
    return input;
  }

  private createBoardInput(
    value: number[][],
    onChange: (newValue: number[][]) => void
  ): HTMLTextAreaElement {
    const input = document.createElement("textarea");
    input.value = JSON.stringify(value, null, 2);
    input.style.padding = "4px";
    input.oninput = (e) => {
      try {
        const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
        onChange(parsed);
      } catch (err) {
        console.error("Invalid board input:", err);
      }
    };
    return input;
  }

  private createPortalsInput(
    value: { pair: [[number, number], [number, number]] }[],
    onChange: (
      newValue: { pair: [[number, number], [number, number]] }[]
    ) => void
  ): HTMLTextAreaElement {
    const input = document.createElement("textarea");
    input.value = JSON.stringify(value, null, 2);
    input.style.padding = "4px";
    input.oninput = (e) => {
      try {
        const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
        if (!Array.isArray(parsed)) throw new Error("Expected an array");
        onChange(parsed);
      } catch (err) {
        console.error("Invalid portals input:", err);
      }
    };
    return input;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = onClick;
    Object.assign(btn.style, {
      padding: "4px 10px",
      cursor: "pointer",
    });
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
    console.log("DebugMenu initialized");
    this.objectToEdit = {
      mode: -1,
      levelData: {
        turns: 100,
        board: [[0, -1, 0]],
        targetColor: 1,
        portals: [],
      },
    };

    const modeInput = this.createNumberInput(
      this.objectToEdit.mode,
      (newValue) => {
        this.objectToEdit.mode = newValue;
      }
    );

    const turnsInput = this.createNumberInput(
      this.objectToEdit.levelData.turns,
      (newValue) => {
        this.objectToEdit.levelData.turns = newValue;
      }
    );

    const boardInput = this.createBoardInput(
      this.objectToEdit.levelData.board,
      (newValue) => {
        this.objectToEdit.levelData.board = newValue;
      }
    );

    const targetColorInput = this.createNumberInput(
      this.objectToEdit.levelData.targetColor,
      (newValue) => {
        this.objectToEdit.levelData.targetColor = newValue;
      }
    );

    const portalsInput = this.createPortalsInput(
      this.objectToEdit.levelData.portals,
      (newValue) => {
        this.objectToEdit.levelData.portals = newValue;
      }
    );

    const textareasRow = document.createElement("div");
    Object.assign(textareasRow.style, {
      display: "flex",
      gap: "10px",
      flexWrap: "nowrap",
    });

    Object.assign(boardInput.style, {
      width: "100%",
      minWidth: "0",
      flex: "1",
      minHeight: "120px",
    });

    Object.assign(portalsInput.style, {
      width: "100%",
      minWidth: "0",
      flex: "1",
      minHeight: "120px",
    });

    textareasRow.appendChild(boardInput);
    textareasRow.appendChild(portalsInput);

    const list = this.createList();

    const setBtn = this.createButton("Set", () => {
      localStorage.setItem(
        "overflowingPalette_debug",
        JSON.stringify(this.objectToEdit)
      );
      this.updateList(list);
    });

    const deleteBtn = this.createButton("Delete", () => {
      localStorage.removeItem("overflowingPalette_debug");
      this.updateList(list);
    });

    const updateBtn = this.createButton("Load from Storage", () => {
      const value = localStorage.getItem("overflowingPalette_debug");
      if (value) {
        this.objectToEdit = JSON.parse(value);
        modeInput.value = this.objectToEdit.mode.toString();
        turnsInput.value = this.objectToEdit.levelData.turns.toString();
        boardInput.value = JSON.stringify(
          this.objectToEdit.levelData.board,
          null,
          2
        );
        targetColorInput.value =
          this.objectToEdit.levelData.targetColor.toString();
        portalsInput.value = JSON.stringify(
          this.objectToEdit.levelData.portals || [],
          null,
          2
        );
      }
    });

    const wrapper = this.createWrapper();
    wrapper.appendChild(list);
    wrapper.appendChild(modeInput);
    wrapper.appendChild(turnsInput);
    wrapper.appendChild(targetColorInput);
    wrapper.appendChild(textareasRow);
    wrapper.appendChild(setBtn);
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(updateBtn);

    this.domContainer = this.scene.add
      .dom(this.container.x, this.container.y, "div", {
        width: `1200px`,
        height: `800px`,
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0, 0)
      .setDepth(1000)
      .setVisible(true);
    this.domContainer.node.appendChild(wrapper);

    this.scene.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "D") {
        const visible = this.domContainer.visible;
        this.domContainer.setVisible(!visible);
      }
    });

    this.updateList(list);
    this.hide();
  }

  hide(): void {
    this.domContainer.setVisible(false);
  }
}
