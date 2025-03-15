import { MenuTab } from "./MenuTab";
import {
  ColorType,
  GameMode,
  LevelDifficulty,
  MenuTabProps,
} from "../../types";

import { OptionFolder } from "../ui/html/OptionFolder";
import { ValueSelector } from "../ui/html/ValueSelector";
import { generateLevel } from "../../utils";
import { OptionSelector } from "../ui/html/OptionSelector";

export class EndlessZen extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;
  difficulty: LevelDifficulty = "Medium";
  colorsCount: number = 4;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

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

    const colorsCount = new ValueSelector<number>(
      "Colors count",
      this.colorsCount,
      () => {
        this.colorsCount = Phaser.Math.Clamp(this.colorsCount - 1, 2, 8);
        return this.colorsCount;
      },
      () => {
        this.colorsCount = Phaser.Math.Clamp(this.colorsCount + 1, 2, 8);
        return this.colorsCount;
      }
    );

    const diffOptions: LevelDifficulty[] = ["Easy", "Medium", "Hard", "Mess"];
    const difficultyIndex = diffOptions.indexOf(this.difficulty);

    const difficulty = new OptionSelector(
      "Difficulty",
      difficultyIndex,
      diffOptions,
      false,
      (selectedIndex) => {
        this.difficulty = diffOptions[selectedIndex];
      }
    );

    folder.add(columns.container);
    folder.add(rows.container);
    folder.add(colorsCount.container);
    folder.add(difficulty.container);

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerdown", () => {
      this.scene.scene.start("LoadingGame", {
        mode: GameMode.Endless,
        endlessOptions: {
          rows: this.rows,
          columns: this.columns,
          colorsCount: this.colorsCount,
          difficulty: this.difficulty,
        },
        levelData: generateLevel(
          this.rows,
          this.columns,
          this.colorsCount,
          this.difficulty
        ),
      });
    });

    this.container.add([viewBox]);
  }
}
