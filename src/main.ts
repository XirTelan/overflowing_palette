import { Game as MainGame } from "./scenes/Game";
import { AUTO, Scale, Types } from "phaser";
import { LevelData } from "./types";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [MainGame],
};

const levelData: LevelData = {
  board: [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 2, 0, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 3, 1, 0, 0, 0, 0, 3, 1, 1],
    [2, 3, 1, 1, 3, 1, 1, 3, 1, 2],
    [2, 2, 1, 1, 3, 1, 1, 3, 2, 2],
  ],
  targetColor: 1,
  turns: 2,
};
const game = new Phaser.Game(config);
game.scene.start("Game", { levelData });
