import { MenuTab } from "./MenuTab";
import { MenuTabProps } from "../../types";

export class LevelEditor extends MenuTab {
  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;

    this.actionBtn.btn.setInteractive();
    this.actionBtn.btn.on("pointerdown", () => {
      this.scene.scene.start("Game", {
        mode: "Editor",
        levelData: {
          board: this.generateField(),
          targetColor: 0,
          turns: 0,
        },
      });
    });
  }
  private generateField() {
    const arr: number[][] = [];
    for (let i = 0; i < 8; i++) {
      arr[i] ??= [];
      for (let j = 0; j < 10; j++) {
        arr[i][j] = 0;
      }
    }

    return arr;
  }
}

// container: Phaser.GameObjects.Container,
// scene: Scene,
// key: string,
// width: number,
// height: number
