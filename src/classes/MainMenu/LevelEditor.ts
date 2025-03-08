import { MenuTab } from "./MenuTab";
import { ColorType, MenuTabProps } from "../../types";
import { ValueSelector } from "../ui/ValueSelector";
import { cicleThrougColors, getColorName } from "../../utils";

export class LevelEditor extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    const { levelEditor } = scene.cache.json.get("config")["mainMenu"];

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerdown", () => {
      this.scene.scene.start("LoadingGame", {
        mode: "Editor",
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

    const columnsText = scene.make
      .text({
        x: 100,
        y: 120,
        text: "Columns:",
        style: levelEditor.defaultStyle,
      })
      .setOrigin(0, 0.5);

    const columns = new ValueSelector<number>(
      scene,
      400,
      columnsText.y,
      200,
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

    const rowsText = scene.make
      .text({
        x: 100,
        y: 50,
        text: "Rows:",
        style: levelEditor.defaultStyle,
      })
      .setOrigin(0, 0.5);

    const rows = new ValueSelector<number>(
      scene,
      400,
      rowsText.y,
      200,
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

    const textFillColor = scene.make
      .text({
        x: 100,
        y: 190,
        text: "Fill color ",
        style: levelEditor.defaultStyle,
      })
      .setOrigin(0, 0.5);

    const fillColorSelector = new ValueSelector<string>(
      scene,
      400,
      textFillColor.y,
      200,

      getColorName(this.selectedFillColor),
      () => {
        return changeTargetColor(-1, this);
      },
      () => {
        return changeTargetColor(1, this);
      }
    );

    this.container.add([
      rowsText,
      rows.container,
      columnsText,
      columns.container,
      textFillColor,
      fillColorSelector.container,
    ]);
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

function changeTargetColor(value: number, editor: LevelEditor) {
  let newTarget = cicleThrougColors(value, editor.selectedFillColor);
  editor.selectedFillColor = newTarget;
  return getColorName(newTarget);
}
