import { MenuTab } from "./MenuTab";
import { ColorType,  GameMode, MenuTabProps } from "../../types";
import { cycleThroughColors, getColorName, getConfig, getLocal } from "../../utils";
import { OptionFolder } from "../ui/html/OptionFolder";
import { ValueSelector } from "../ui/html/ValueSelector";

export class LevelEditor extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    const { colors } = getConfig(scene);
    const { levelEditor } = getLocal(scene);

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);

    const folder = new OptionFolder(levelEditor.folderName);
    viewBox.node.appendChild(folder.container);

    const columns = new ValueSelector(
      levelEditor.gridColumns,
      this.columns,
      () => {
        this.columns = Phaser.Math.Clamp(this.columns - 1, 2, 100);
        return this.columns;
      },
      () => {
        this.columns = Phaser.Math.Clamp(this.columns + 1, 2, 100);
        return this.columns;
      }
    );

    const rows = new ValueSelector<number>(
      levelEditor.gridRows,
      this.rows,
      () => {
        this.rows = Phaser.Math.Clamp(this.rows - 1, 2, 100);
        return this.rows;
      },
      () => {
        this.rows = Phaser.Math.Clamp(this.rows + 1, 2, 100);
        return this.rows;
      }
    );

    const fillColorSelector = new ValueSelector<string>(
      levelEditor.gridColor,
      getColorName(this.selectedFillColor, colors),
      () => {
        return this.changeTargetColor(-1);
      },
      () => {
        return this.changeTargetColor(1);
      }
    );

    folder.add(columns.container);
    folder.add(rows.container);
    folder.add(fillColorSelector.container);

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerup", () => {
      this.scene.scene.start("LoadingGame", {
        mode: GameMode.Editor,
        levelData: {
          board: this.generateField(
            this.rows,
            this.columns,
            this.selectedFillColor
          ),
          targetColor: 0,
          turns: 1,
        },
      });
    });

    this.container.add([viewBox]);
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
  changeTargetColor(value: number) {
    const { colors } = getConfig(this.scene);
    let newTarget = cycleThroughColors(value, this.selectedFillColor);
    this.selectedFillColor = newTarget;
    return getColorName(newTarget, colors);
  }
}
