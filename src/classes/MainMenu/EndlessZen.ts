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
import { CheckBox } from "../ui/html/Checkbox";

export class EndlessZen extends MenuTab {
  selectedFillColor: ColorType = 0;
  rows: number = 8;
  columns: number = 10;
  difficulty: LevelDifficulty = 1;
  colorsCount: number = 4;

  blockedCheckBox: CheckBox;
  portalCheckBox: CheckBox;
  timerCheckBox: CheckBox;

  scene: Phaser.Scene;

  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;
    this.scene = scene;

    const viewBox = scene.add
      .dom(0, 0, "div", {
        width: `${width}px`,
        height: `${height}px`,
      })
      .setOrigin(0);

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerup", this.loadGame, this);

    const options = this.createOptions();
    const mehanics = this.createMehanics();
    viewBox.node.appendChild(options.container);
    viewBox.node.appendChild(mehanics.container);
    this.container.add(viewBox);
  }

  createOptions() {
    const { endlessZen } = getLocal(this.scene);

    const folder = new OptionFolder(endlessZen.folderName);

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
    const difficulty = new OptionSelector(
      endlessZen.difficulty,
      this.difficulty,
      endlessZen.difficulties,
      false,
      (selectedIndex) => {
        this.difficulty = selectedIndex as LevelDifficulty;
      }
    );

    folder.add([
      columns.container,
      rows.container,
      colorsCount.container,
      difficulty.container,
    ]);

    return folder;
  }

  createMehanics() {
    const { endlessZen } = getLocal(this.scene);

    const folder = new OptionFolder(endlessZen.folderMehanics);

    this.blockedCheckBox = new CheckBox(endlessZen.blocked);
    this.portalCheckBox = new CheckBox(endlessZen.portals);
    this.timerCheckBox = new CheckBox(endlessZen.timer);

    folder.add([
      this.blockedCheckBox.container,
      this.portalCheckBox.container,
      this.timerCheckBox.container,
    ]);

    return folder;
  }

  loadGame() {
    const mehanics = {
      blocked: this.blockedCheckBox.checked,
      portals: this.portalCheckBox.checked,
      timers: this.timerCheckBox.checked,
    };
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start("LoadingGame", {
        mode: GameMode.Endless,
        endlessOptions: {
          rows: this.rows,
          columns: this.columns,
          colorsCount: this.colorsCount,
          difficulty: this.difficulty,
          mehanics,
        },
        levelData: generateLevel(
          this.rows,
          this.columns,
          this.colorsCount,
          this.difficulty,
          mehanics
        ),
      });
    });
  }
}
