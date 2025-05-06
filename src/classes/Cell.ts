import { CellAction, ColorConfig, ColorType, GameConfig } from "../types";
import { BlendModes } from "phaser";
import { Game } from "../scenes/Game";

const TILE_BASE_SIZE = 64;

export default abstract class Cell {
  protected scene: Game;
  cellSize: number;
  tileScale: number;

  container: Phaser.GameObjects.Container;

  tile: Phaser.GameObjects.Image | Phaser.GameObjects.Shader;
  transitionTile: Phaser.GameObjects.Image;
  portal: Phaser.GameObjects.Rectangle;

  linkendCell?: Cell;

  protected _color: ColorType;
  get color() {
    return this._color;
  }

  protected colors: ColorConfig;
  action: CellAction;

  pos: { x: number; y: number };
  constructor(
    scene: Game,
    x: number,
    y: number,
    color: ColorType,
    gap: number,
    cellSize: number,
    action: (x: number, y: number) => void
  ) {
    this.scene = scene;
    this._color = color;
    this.cellSize = cellSize;
    this.tileScale = this.cellSize / TILE_BASE_SIZE;

    this.container = scene.add.container(
      y * (cellSize + gap),
      x * (cellSize + gap)
    );

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
    this.container.add(transitionTile);
  }

  abstract onEnter(): void;
  abstract onLeave(): void;
  onClick() {
    this.action(this.pos.x, this.pos.y);
  }

  setTileInteractions() {
    this.tile.setInteractive();
    this.tile.on("pointerup", this.onClick, this);
    this.tile.on("pointerover", this.onEnter, this);
    this.tile.on("pointerout", this.onLeave, this);
  }

  setLinkedCell(cell: Cell) {
    const mask = this.scene.add
      .image(this.tile.x, this.tile.y, "portalMask")
      .setOrigin(0)
      .setScale(this.tileScale);
    mask.name = "portalMask";
    this.linkendCell = cell;
    this.container.add(mask);
  }

  unlink() {
    this.linkendCell = undefined;
    const test = this.container.getByName("portalMask");
    this.container.remove(test, true);
  }

  abstract setColor(color: ColorType): void;
  abstract transitionStart(...args: any[]): void;
  abstract transitionEnd(): void;
  abstract transitionUpdate(progress: number): void;
}
