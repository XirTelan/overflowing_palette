import { MenuTabProps, Vector3 } from "../../../types";
import { getLocal } from "../../../utils";
import { MenuTab } from "../MenuTab";
import { ColorsTab } from "./ColorsTab";
import { GeneralTab } from "./GeneralTab";
import { OptionTab } from "./OptionTab";

export class Options extends MenuTab {
  inputs: HTMLInputElement[] = [];
  isSimpleColors: HTMLInputElement;
  strongerHighlight: HTMLInputElement;

  colorTab: ColorsTab;
  generalTab: GeneralTab;

  tabs: OptionTab[] = [];

  activeTab = "general";

  constructor(props: MenuTabProps) {
    super(props);
    const scene = this.scene;
    const { options } = getLocal(scene);

    this.actionBtn.text.setText("Save");
    // this.actionBtn.container.setScale(1);
    // this.actionBtn.container.setPosition(props.width - 175, props.height - 25);
    this.actionBtn.btn.on("pointerdown", this.saveUserConfig, this);

    const tabBtns = document.createElement("div");
    const tabs = document.createElement("div");
    this.contentContainer.appendChild(tabBtns);
    this.contentContainer.appendChild(tabs);

    this.generalTab = new GeneralTab(
      scene,
      "general",
      true,
      options.tabs.general,
      800,
      tabBtns,
      tabs,
      this.updateActiveTab,
      this
    );

    this.colorTab = new ColorsTab(
      scene,
      "colors",
      false,
      options.tabs.colors,
      800,
      tabBtns,
      tabs,
      this.updateActiveTab,
      this
    );

    this.tabs.push(
      ...[
        this.generalTab,
        this.colorTab,
        new OptionTab(
          "gameplay",
          false,
          options.tabs.gameplay,
          tabBtns,
          tabs,
          this.updateActiveTab,
          this
        ),
      ]
    );

    this.contentContainer.classList.add("menu-options");

    // this.container.add(resetBtn.container);
  }

  updateActiveTab(key: string) {
    this.activeTab = key;
    this.tabs.forEach((tab) => {
      if (tab.key !== this.activeTab) {
        tab.disable();
      } else {
        tab.activate();
      }
    });
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

    this.inputs.forEach((input, indx) => {
      const fromCache = colors[indx];
      const color = Phaser.Display.Color.RGBToString(
        fromCache.x * 255,
        fromCache.y * 255,
        fromCache.z * 255
      );
      input.style.background = color;
      input.value = color;
    });
  }
  resetUserConfig() {
    Object.keys(localStorage).forEach((key) => {
      if (key === "clearedLevels") return;
      localStorage.removeItem(key);
    });
    this.hide();
  }
  saveUserConfig() {
    // const colors: Record<number, Vector3> = {};
    // this.inputs.forEach((input, indx) => {
    //   const color = Phaser.Display.Color.HexStringToColor(input.value);
    //   colors[indx] = {
    //     x: color.red / 255,
    //     y: color.green / 255,
    //     z: color.blue / 255,
    //   };
    // });
    const colorsData = this.colorTab.getValues();
    const generalData = this.generalTab.getValues();
    console.log("colorsData", colorsData);
    console.log("generalData", generalData);

    // if (this.isSimpleColors.checked) {
    //   localStorage.setItem(
    //     "shader.lightenFactor",
    //     JSON.stringify({ type: "1f", value: 1.0 })
    //   );
    // } else {
    //   localStorage.removeItem("shader.lightenFactor");
    // }

    // if (this.strongerHighlight.checked) {
    //   localStorage.setItem(
    //     "shader.activeOffset",
    //     JSON.stringify({ type: "2f", value: { x: 0.0, y: 0.7 } })
    //   );
    // } else {
    //   localStorage.removeItem("shader.activeOffset");
    // }

    localStorage.setItem("colors", JSON.stringify(colorsData));
    localStorage.setItem("background", JSON.stringify(generalData.background));
    localStorage.setItem("lang", generalData.lang);
    this.hide();
  }
}
