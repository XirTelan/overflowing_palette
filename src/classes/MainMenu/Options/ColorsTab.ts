import { Scene } from "phaser";
import { OptionTab } from "./OptionTab";
import { ColorConfig, Vector3 } from "../../../types";
import { OptionFolder } from "../../ui/html/OptionFolder";
import { normalizedRgbToHexString } from "../../../utils";

export class ColorsTab extends OptionTab {
  colorInputs: ColorInputs = {
    names: [],
    values: [],
  };

  constructor(
    scene: Scene,
    key: string,
    isActive: boolean,
    btnText: string,
    width: number,
    btnContainer: HTMLDivElement,
    tabsContainer: HTMLDivElement,
    callback: (key: string) => void,
    context: object
  ) {
    super(
      key,
      isActive,
      btnText,
      btnContainer,
      tabsContainer,
      callback,
      context
    );

    const { colors }: { colors: ColorConfig } = scene.cache.json.get("config");

    const colorsList = document.createElement("div");
    colorsList.classList.add("colors");

    const folder = new OptionFolder("Colors customization");
    folder.add(colorsList);

    this.tab.appendChild(folder.container);

    Object.entries(colors).forEach(([, value], index) => {
      colorsList.appendChild(
        this.createColorSelector(index + 1, value.colorName, value.value)
      );
    });
  }

  private createColorSelector(index: number, name: string, value: Vector3) {
    const container = document.createElement("div");
    container.classList.add("selector");

    const indexBlock = document.createElement("div");
    indexBlock.classList.add("selector__index");
    const indexText = document.createElement("span");
    indexText.textContent = `${index}`;
    indexBlock.append(indexText);

    const colorName = document.createElement("input");
    colorName.classList.add("selector__name");
    colorName.defaultValue = name;

    const colorPicker = document.createElement("input");
    colorPicker.setAttribute("type", "color");
    colorPicker.defaultValue = `${normalizedRgbToHexString(value)}`;

    container.appendChild(indexBlock);
    container.appendChild(colorName);
    container.appendChild(colorPicker);

    this.colorInputs.names.push(colorName);
    this.colorInputs.values.push(colorPicker);
    return container;
  }

  getValues() {
    const result: Record<number, ColorConfig[0]> = {};
    this.colorInputs.names.forEach((name, indx) => {
      const color = Phaser.Display.Color.HexStringToColor(
        this.colorInputs.values[indx].value
      );
      result[indx] = {
        colorName: name.value,
        value: {
          x: color.red / 255,
          y: color.green / 255,
          z: color.blue / 255,
        },
      };
    });
    return result;
  }
}

type ColorInputs = {
  names: HTMLInputElement[];
  values: HTMLInputElement[];
};
