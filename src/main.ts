import { Game } from "./scenes/Game";
import { AUTO, Scale, Types } from "phaser";
import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1920,
  height: 1080,
  parent: "game-container",
  backgroundColor: "#121212",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, MainMenu, Game],
};

const game = new Phaser.Game(config);

game.scene.start("Boot");
