import { Game } from "../../scenes/Game";
import { GameMode, GameStatus, LevelData } from "../../types";
import { getLocal } from "../../utils";
import { OptionFolder } from "../ui/html/OptionFolder";
import { Switch } from "../ui/html/Switch";

export class Export {
  viewBox: Phaser.GameObjects.DOMElement;

  scene: Game;

  container: Phaser.GameObjects.Container;

  share: { json: string; base64: string };

  stringInput: HTMLTextAreaElement;
  jsonInput: HTMLPreElement;

  folderString: OptionFolder;
  folderJson: OptionFolder;

  selectedType: "string" | "json" = "string";

  constructor(scene: Game) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);

    const { width, height } = scene.cameras.main;

    const local = getLocal(scene);

    const bg = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0);

    this.viewBox = scene.add
      .dom(scene.cameras.main.width / 2 - 8, 0, "div", {
        width: "1000px",
        height: `${height}px`,
        fontSize: "24px",
        overflow: "auto",
      })
      .setOrigin(0.5, 0);

    const contentContainer = document.createElement("div");

    contentContainer.classList.add("wrapper", "export-wrapper");
    this.viewBox.node.appendChild(contentContainer);

    this.folderString = new OptionFolder("Export as string");
    this.folderJson = new OptionFolder("Export as JSON");

    const baseText = document.createElement("textarea");
    baseText.classList.add("export__base");
    baseText.disabled = true;
    this.folderString.add(baseText);

    this.stringInput = baseText;

    const jsonText = document.createElement("pre");
    jsonText.classList.add("export__json");

    this.jsonInput = jsonText;

    this.folderJson.add(jsonText);

    const buttonsBlock = document.createElement("div");
    Object.assign(buttonsBlock.style, {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      marginTop: "1rem",
    });
    const btn = document.createElement("button");
    btn.classList.add("primary-btn");
    btn.addEventListener("click", () => {
      this.hide();
    });
    btn.textContent = "Cancel";

    const btn2 = document.createElement("button");
    btn2.classList.add("primary-btn");
    btn2.addEventListener("click", () => {
      this.copyToClipboard();
    });
    btn2.textContent = "Copy to clipboard";

    buttonsBlock.appendChild(btn);
    buttonsBlock.appendChild(btn2);

    const exportTypeSwitch = new Switch(
      {
        text: "By string",
        value: "string",
      },
      {
        text: "By JSON",
        value: "json",
      },
      (value) => {
        this.toggleFolders(value as typeof this.selectedType);
      }
    );

    const title = document.createElement("div");
    title.textContent = "EXPORT LEVEL";
    title.className = "block-title";

    contentContainer.appendChild(title);
    contentContainer.appendChild(exportTypeSwitch.container);
    contentContainer.appendChild(this.folderString.container);
    contentContainer.appendChild(this.folderJson.container);

    contentContainer.appendChild(buttonsBlock);

    this.container.add([bg, this.viewBox]);
    this.viewBox.depth = 10;

    this.update();
    this.toggleFolders(this.selectedType);
    this.hide();
  }
  toggleFolders(type: typeof this.selectedType) {
    if (type === "string") {
      this.folderString.container.style.display = "block";
      this.folderJson.container.style.display = "none";
    } else {
      this.folderString.container.style.display = "none";
      this.folderJson.container.style.display = "block";
    }
    this.selectedType = type;
  }

  private copyToClipboard() {
    navigator.clipboard.writeText(
      this.selectedType === "string" ? this.share.base64 : this.share.json
    );
    this.hide();
  }

  createShareData() {
    const data =
      this.scene.gameStates.mode === GameMode.Endless
        ? this.scene.grid.defaultValues
        : this.scene.grid.board.map((cell) => {
            return cell.map((cell) => cell.color);
          });

    const jsonData: LevelData = {
      targetColor: this.scene.gameStates.targetColor,
      turns: this.scene.gameStates.turns,
      tools: this.scene.gameStates.availableTools,
      board: data,
    };

    this.share = {
      json: JSON.stringify(jsonData, null, "\t"),
      base64: btoa(JSON.stringify(jsonData, null)),
    };
  }

  update() {
    this.createShareData();
    this.stringInput.textContent = this.share.base64;
    this.jsonInput.textContent = this.share.json;
  }

  show() {
    this.scene.input.enabled = false;
    this.scene.setGameState(GameStatus.Waiting);
    this.update();
    this.container.setVisible(true);
  }
  hide() {
    this.scene.input.enabled = true;
    this.scene.setGameState(GameStatus.Active);
    this.container.setVisible(false);
  }
}
