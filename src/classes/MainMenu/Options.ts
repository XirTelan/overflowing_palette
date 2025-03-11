import { MenuTabProps, Vector3 } from "../../types";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { MenuTab } from "./MenuTab";
import { OptionTab } from "./OptionTab";

export class Options extends MenuTab {
  localCache: Record<number, Vector3>;
  inputs: HTMLInputElement[] = [];
  isSimpleColors: HTMLInputElement;
  strongerHighlight: HTMLInputElement;

  constructor(props: MenuTabProps) {
    super(props);
    const scene = this.scene;
    const { colors } = scene.cache.json.get("config");

    this.actionBtn.text.setText("Save");
    this.actionBtn.container.setScale(1);
    this.actionBtn.container.setPosition(
      props.width / 2 + 175,
      props.height + 25
    );
    this.actionBtn.btn.on("pointerdown", this.save, this);
    const resetBtn = new PrimaryBtn(
      props.width / 2 - 25,
      this.actionBtn.container.y,
      "Reset",
      200,
      0,
      scene,
      this.reset,
      this
    );

    const colorsContainer = document.createElement("div");
    colorsContainer.classList.add("colors-container");

    const tabBtns = document.createElement("div");
    const tabs = document.createElement("div");
    this.contentContainer.appendChild(tabBtns);
    this.contentContainer.appendChild(tabs);
    new OptionTab("general", "General", tabBtns, tabs);
    new OptionTab("grid", "Grid", tabBtns, tabs);

    // const text = document.createElement("p");
    // text.textContent = "After any changes (save/reset) refresh game";
    // text.style = "color:#fff;";
    // text.classList.add("options-text");

    // this.contentContainer.append(text);
    this.addText("Colors", this.contentContainer, "category");
    this.contentContainer.append(colorsContainer);
    this.addText("Grid", this.contentContainer, "category");

    this.contentContainer.classList.add("menu-options");

    this.container.add(resetBtn.container);

    Object.entries(colors).forEach((color) => {
      const input = document.createElement("input");
      input.setAttribute("type", "color");
      this.inputs.push(input);
      input.value = "#ffffff";
      colorsContainer.append(input);
    });

    this.isSimpleColors = this.addCheckbox(
      "Simple colors",
      this.contentContainer,
      "shader.lightenFactor"
    );

    this.strongerHighlight = this.addCheckbox(
      "Stronger higlight",
      this.contentContainer,
      "shader.activeOffset"
    );
  }

  addText(text: string, container: HTMLDivElement, className?: string) {
    const block = document.createElement("p");
    block.textContent = text;
    if (className) {
      block.classList.add(className);
    }
    container.append(block);
  }
  addCheckbox(text: string, container: HTMLDivElement, key: string) {
    const divContainer = document.createElement("div");
    divContainer.style =
      "display:flex;justify-content:space-between;align-items:center;padding:1rem;";
    this.addText(text, divContainer);
    const checkBox = document.createElement("input");
    const data = localStorage.getItem(key);
    if (data) {
      checkBox.checked = true;
    }
    divContainer.append(checkBox);
    checkBox.setAttribute("type", "checkbox");

    container.append(divContainer);
    return checkBox;
  }

  show(): void {
    super.show();
    this.update();
  }
  update() {
    const { colors } = this.scene.cache.json.get("config");
    this.localCache = colors;

    this.inputs.forEach((input, indx) => {
      const fromCache = this.localCache[indx];
      const color = Phaser.Display.Color.RGBToString(
        fromCache.x * 255,
        fromCache.y * 255,
        fromCache.z * 255
      );
      input.style.background = color;
      input.value = color;
    });
  }
  reset() {
    Object.keys(localStorage).forEach((key) => {
      if (key === "clearedLevels") return;
      localStorage.removeItem(key);
    });
    this.hide();
  }
  save() {
    const colors: Record<number, Vector3> = {};
    this.inputs.forEach((input, indx) => {
      const color = Phaser.Display.Color.HexStringToColor(input.value);
      colors[indx] = {
        x: color.red / 255,
        y: color.green / 255,
        z: color.blue / 255,
      };
    });
    if (this.isSimpleColors.checked) {
      localStorage.setItem(
        "shader.lightenFactor",
        JSON.stringify({ type: "1f", value: 1.0 })
      );
    } else {
      localStorage.removeItem("shader.lightenFactor");
    }

    if (this.strongerHighlight.checked) {
      localStorage.setItem(
        "shader.activeOffset",
        JSON.stringify({ type: "2f", value: { x: 0.0, y: 0.7 } })
      );
    } else {
      localStorage.removeItem("shader.activeOffset");
    }

    localStorage.setItem("colors", JSON.stringify(colors));
    this.hide();
  }
}
