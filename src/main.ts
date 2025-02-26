import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game, Scale, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
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

const levelData = [
  [0, 0, 0, 0, 2],
  [1, 0, 0, 2, 0],
  [1, 0, 2, 2, 0],
  [1, 1, 0, 2, 0],
  [1, 0, 1, 2, 0],
  [1, 0, 0, 2, 0],
];
const game = new Phaser.Game(config);
game.scene.start("Game", { levelData });
