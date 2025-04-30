import { ColorConfig, ColorType, GameConfig } from "../types";
import { BlendModes } from "phaser";
import { Game } from "../scenes/Game";

const TILE_BASE_SIZE = 64;

export default abstract class Cell {
  scene: Game;
  cellSize: number;
  tileScale: number;

  tile: Phaser.GameObjects.Image | Phaser.GameObjects.Shader;
  transitionTile: Phaser.GameObjects.Image;
  color: ColorType;
  colors: ColorConfig;
  action: (x: number, y: number, color: ColorType) => void;

  pos: { x: number; y: number };
  constructor(
    scene: Game,
    x: number,
    y: number,
    color: ColorType,
    cellSize: number,
    action: (x: number, y: number, color: ColorType) => void
  ) {
    this.scene = scene;
    this.color = color;
    this.cellSize = cellSize;
    this.tileScale = this.cellSize / TILE_BASE_SIZE;

    this.action = action;

    const { colors } = scene.cache.json.get("config") as GameConfig;
    this.colors = colors;

    this.pos = { x, y };
  }

  createTransitionTile() {
    const transitionTile = this.scene.add
      .image(
        this.tile.x + this.cellSize / 2,
        this.tile.y + this.cellSize / 2,
        "transitionTile"
      )
      .setScale(this.tileScale)
      .setBlendMode(BlendModes.ADD);

    transitionTile.setVisible(false);

    this.transitionTile = transitionTile;
  }

  abstract onEnter(): void;
  abstract onLeave(): void;
  onClick() {
    this.action(this.pos.x, this.pos.y, this.color);
  }

  setTileInteractions() {
    this.tile.setInteractive();
    this.tile.on("pointerup", this.onClick, this);
    this.tile.on("pointerover", this.onEnter, this);
    this.tile.on("pointerout", this.onLeave, this);
  }

  abstract setColor(color: ColorType): void;
  abstract transitionStart(...args: any[]): void;
  abstract transitionEnd(): void;
  abstract transitionUpdate(progress: number): void;
}
