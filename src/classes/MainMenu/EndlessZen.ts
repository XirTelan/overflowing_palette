import { MenuTab } from "./MenuTab";
import { ColorType, GameMode, MenuTabProps } from "../../types";
import { ValueSelector } from "../ui/ValueSelector";
import { cicleThrougColors, getColorName } from "../../utils";
import { LevelEditor } from "./LevelEditor";

export class EndlessZen extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    const { levelEditor } = scene.cache.json.get("config")["mainMenu"];
  }
  
  private generateField(rows: number, cols: number, color: ColorType) {
    const arr: number[][] = [];
    for (let i = 0; i < rows; i++) {
      arr[i] ??= [];
      for (let j = 0; j < cols; j++) {
        arr[i][j] = color;
      }
    }

    return arr;
  }
}
