import { Game } from "./scenes/Game";
import { AUTO, Scale, Types } from "phaser";
import { Boot } from "./scenes/Boot";
import { MainMenu } from "./scenes/MainMenu";
import { LoadingGame } from "./scenes/LoadingGame";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1920,
  height: 1080,
  parent: "game-container",
  backgroundColor: "#121212",
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, MainMenu, LoadingGame, Game],
};

const game = new Phaser.Game(config);

document.addEventListener("DOMContentLoaded", () => {
  game.scene.start("Boot");
});
