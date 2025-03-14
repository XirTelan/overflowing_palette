export enum ColorType {
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "cyan",
}
export type Color = {
  colorName: string;
  value: Vector3;
};
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
  author?: string;
  tools?: [number, number, number];
};

export type LevelsJson = LevelFolder[];

export type LevelFolder = {
  folderName: string;
  categories: LevelCategory[];
};

export type LevelCategory = { categoryName: string; levels: LevelData[] };

export enum GameStatus {
  "Waiting",
  "Active",
}

export type LanguageConfig = {
  mainMenu: {
    selectLevel: string;
    endlessZen: string;
    createLevel: string;
    options: string;
    gitHub: string;
  };
  game: {
    ui: {
      mode: string;
      turnsRemains: string;
      targetColor: string;
      targetColorEditor: string;
      movesCount: string;
    };
  };
  resultScreen: {
    win: string;
    time: string;
    btnMain: string;
    btnNext: string;
  };
  options: {
    tabs: {
      general: string;
      colors: string;
      gameplay: string;
    };
    generalTab: {
      languageBlock: string;
      languageSelection: string;
      background: string;
      image: string;
      distortion: string;
      overlay: string;
    };
  };
  import: string;
  export: string;
  copyJson: string;
  copyString: string;
};

export type LocalizationConfig = {
  meta: {
    langsAvailable: {
      key: string;
      name: string;
    }[];
  };
  langs: {
    [key: string]: LanguageConfig;
  };
};

export type ColorConfig = {
  [key in ColorType]: {
    colorName: string;
    value: Vector3;
  };
};

export type BackgroundConfig = {
  current: {
    key: string;
    distortion: number;
    overlay: number;
  };
  options: {
    key: string;
    name: string;
  }[];
};

export type GameConfig = {
  gameplay: {
    highlightIntensity: number;
    fluidColors: number;
  };
  background: BackgroundConfig;
  colors: ColorConfig;
  shaders: {
    base: { init: Record<string, unknown> };
  };
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
    ui: UiOptions;
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
    size: number;
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

export enum GameMode {
  "Play",
  "Editor",
}

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
  mode: GameMode;
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
