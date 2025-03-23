import { MenuTab } from "./MenuTab";
import {
  ColorType,
  GameMode,
  LevelDifficulty,
  MenuTabProps,
} from "../../types";

import { OptionFolder } from "../ui/html/OptionFolder";
import { ValueSelector } from "../ui/html/ValueSelector";
import { generateLevel, getLocal } from "../../utils";
import { OptionSelector } from "../ui/html/OptionSelector";

export class EndlessZen extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;
  difficulty: LevelDifficulty = 1;
  colorsCount: number = 4;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    const { endlessZen } = getLocal(scene);

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);

    const folder = new OptionFolder(endlessZen.folderName);
    viewBox.node.appendChild(folder.container);

    const columns = new ValueSelector(
      endlessZen.columnsCount,
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
      endlessZen.rowsCount,
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
      endlessZen.colorsCount,
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

    const diffOptions = endlessZen.difficulties;

    const difficulty = new OptionSelector(
      endlessZen.difficulty,
      this.difficulty,
      diffOptions,
      false,
      (selectedIndex) => {
        this.difficulty = selectedIndex as LevelDifficulty;
      }
    );

    folder.add(columns.container);
    folder.add(rows.container);
    folder.add(colorsCount.container);
    folder.add(difficulty.container);

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerdown", this.loadGame, this);

    this.container.add([viewBox]);
  }

  loadGame() {
    this.scene.time.delayedCall(100, () => {
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
  }
}
