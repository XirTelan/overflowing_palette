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

export type LevelsJson = [LevelFolder];

export type LevelFolder = {
  folderName: string;
  categories: [LevelCategory];
};

export type LevelCategory = { categoryName: string; levels: LevelData[] };

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
  transition: {
    default: number;
    minimum: number;
  };
  offset: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  borderPadding: number;
  gap: number;
  borderOffset: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};

export type UiOptions = {
  resetBtn: {
    btn: {};
    hotkeyBtn: {
      key: string;
      frame: string;
      scale: number;
    };
    hotkeyText: {
      text: string;
      style: {
        color: string;
        font: string;
      };
      origin: {
        x: number;
        y: number;
      };
    };
    text: {
      text: string;
      style: {
        color: string;
        font: string;
      };
      origin: {
        x: number;
        y: number;
      };
    };
  };
  targetUI: {
    x: number;
    y: number;
  };
  colorButtons: {
    gap: number;
  };
  closeBtn: {
    offset: {
      x: number;
      y: number;
    };
    scale: number;
  };
  targetValueSelector: {
    x: number;
    y: number;
    width: number;
  };
  turnsValueSelector: {
    x: number;
    y: number;
    width: number;
  };
};

export type GameStates = {
  levelKey: string;
  turns: number;
  state: GameStatus;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
  availableColors: Set<ColorType>;
  initialState: {
    turns: number;
    remains: number;
  };
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
