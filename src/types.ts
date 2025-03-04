export enum ColorType {
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "cyan",
}

export type Vector2 = {
  x: number;
  y: number;
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type LevelData = {
  board: number[][];
  targetColor: number;
  turns: number;
};

export enum GameStatus {
  "Waiting",
  "Active",
}

export type GameConfig = {
  mainMenu: {
    buttonsBlock: {
      x: number;
      y: number;
      keys: string[];
      gap: number;
    };
  };
  game: {
    gridOptions: GridOptions;
  };
};

export type GridOptions = {
  width: number;
  height: number;
  borderPadding: number;
  gap: number;
  borderOffset: {
    x: number;
    y: number;
  };
};

export type GameStates = {
  turns: number;
  state: GameStatus;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
  availableColors: Set<ColorType>;
  mode: "Play" | "Editor";
};

export type LoadingConfig = {
  width: number;
  boxPadding: number;
  height: number;
};

export interface MenuTabProps {
  x: number;
  y: number;
  scene: Phaser.Scene;
  key: string;
  width: number;
  height: number;
}
