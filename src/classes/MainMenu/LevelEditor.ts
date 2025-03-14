import { MenuTab } from "./MenuTab";
import { ColorType, GameConfig, GameMode, MenuTabProps } from "../../types";
import { cicleThrougColors, getColorName } from "../../utils";
import { OptionFolder } from "../ui/html/OptionFolder";
import { Record } from "../ui/html/Record";
import { ValueSelector } from "../ui/html/ValueSelector";

export class LevelEditor extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    const { colors } = scene.cache.json.get("config") as GameConfig;

    console.log("w,h", width, height);

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);

    const folder = new OptionFolder("Grid Options");
    viewBox.node.appendChild(folder.container);

    const columns = new ValueSelector(
      "Columns",
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
      "Rows",
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
      "Fill Color",
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
    this.actionBtn.btn.on("pointerdown", () => {
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

    // const columnsText = scene.make
    //   .text({
    //     x: 100,
    //     y: 120,
    //     text: "Columns:",
    //     style: levelEditor.defaultStyle,
    //   })
    //   .setOrigin(0, 0.5);

    // const columns = new ValueSelector<number>(
    //   scene,
    //   400,
    //   columnsText.y,
    //   200,
    //   this.columns,
    //   () => {
    //     this.columns = Phaser.Math.Clamp(this.columns - 1, 2, 100);
    //     return this.columns;
    //   },
    //   () => {
    //     this.columns = Phaser.Math.Clamp(this.columns + 1, 2, 100);
    //     return this.columns;
    //   }
    // );

    // const rowsText = scene.make
    //   .text({
    //     x: 100,
    //     y: 50,
    //     text: "Rows:",
    //     style: levelEditor.defaultStyle,
    //   })
    //   .setOrigin(0, 0.5);

    // const rows = new ValueSelector<number>(
    //   scene,
    //   400,
    //   rowsText.y,
    //   200,
    //   this.rows,
    //   () => {
    //     this.rows = Phaser.Math.Clamp(this.rows - 1, 2, 100);
    //     return this.rows;
    //   },
    //   () => {
    //     this.rows = Phaser.Math.Clamp(this.rows + 1, 2, 100);
    //     return this.rows;
    //   }
    // );

    // const textFillColor = scene.make
    //   .text({
    //     x: 100,
    //     y: 190,
    //     text: "Fill color ",
    //     style: levelEditor.defaultStyle,
    //   })
    //   .setOrigin(0, 0.5);

    // const fillColorSelector = new ValueSelector<string>(
    //   scene,
    //   400,
    //   textFillColor.y,
    //   200,

    //   getColorName(this.selectedFillColor),
    //   () => {
    //     return changeTargetColor(-1, this);
    //   },
    //   () => {
    //     return changeTargetColor(1, this);
    //   }
    // );

    this.container.add([
      viewBox,
      // rowsText,
      // rows.container,
      // columnsText,
      // columns.container,
      // textFillColor,
      // fillColorSelector.container,
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
  changeTargetColor(value: number) {
    const { colors } = this.scene.cache.json.get("config") as GameConfig;
    let newTarget = cicleThrougColors(value, this.selectedFillColor);
    this.selectedFillColor = newTarget;
    return getColorName(newTarget, colors);
  }
}
