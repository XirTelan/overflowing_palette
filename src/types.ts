import { RATES } from "./utils";

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

export type Vector3 = Vector2 & {
  z: number;
};

export enum Tools {
  "none",
  "All",
  "Horizontal",
  "Vertical",
}

export type LevelData = {
  board: number[][];
  targetColor: number;
  turns: number;
  author?: string;
  tools?: [number, number, number];
};

export type LevelDifficulty = keyof typeof RATES;

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

export type EndlessOptions = {
  rows: number;
  columns: number;
  colorsCount: number;
  difficulty: LevelDifficulty;
};

export type LanguageConfig = {
  loading: string;
  colors: string[];
  levels: Record<string, string>;
  backgounds: Record<string, string>;
  previewBlock: {
    preview: string;
    author: string;
    moves: string;
    gridSize: string;
    targetColor: string;
    cleared: string;
    time: string;
    timeDefault: string;
  };
  mainMenu: {
    startBtn: string;
    backBtn: string;
    selectLevel: string;
    endlessZen: string;
    createLevel: string;
    options: string;
    gitHub: string;
    importBtn: string;
  };
  endlessZen: {
    folderName: string;
    columnsCount: string;
    rowsCount: string;
    colorsCount: string;
    difficulty: string;
    difficulties: string[];
  };
  game: {
    ui: {
      skipBtn: string;
      mode: string;
      movesRemain: string;
      movesUsed: string;
      targetColor: string;
      targetColorEditor: string;
      movesCount: string;
      resetBtn: string;
      export: string;
      tools: string;
      toolUses: string;
      toolSelected: string;
    };
    tools: Record<string, string>;
  };
  levelEditor: {
    folderName: string;
    gridColumns: string;
    gridRows: string;
    gridColor: string;
  };
  resultScreen: {
    win: string;
    time: string;
    btnMain: string;
    btnNext: string;
    btnShare: string;
    movesUsed: string;
  };
  options: {
    btnSave: string;
    btnReset: string;
    tabs: {
      general: string;
      colors: string;
      gameplay: string;
    };
    colorsTab: {
      folderName: string;
    };
    generalTab: {
      languageBlock: string;
      languageSelection: string;
      background: string;
      image: string;
      distortion: string;
      overlay: string;
    };
    gameplayTab: {
      animationSpeed: string;
      performanceMode: {
        text: string;
        options: [string, string];
      };
      folderName: string;
      highlightIntensity: {
        text: string;
        options: [string, string];
      };
      fluidColors: {
        text: string;
        options: [string, string];
      };
      soundVolume: string;
    };
    defaultToggle: [string, string];
  };
  importBlock: {
    startBtn: string;
    folderName: string;
    loadBtn: string;
    cancelBtn: string;
  };
  exportBlock: {
    title: string;
    copyJson: string;
    copyString: string;
    switch: {
      string: string;
      json: string;
    };
    folders: {
      string: string;
      json: string;
    };
    cancelBtn: string;
    copy: string;
  };
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
  options: string[];
};

export type GameConfig = {
  gameplay: {
    performanceMode: boolean;
    highlightIntensity: number;
    fluidColors: number;
    sound: number;
    transitionDefault: number;
    transitionMinimum: number;
    transitionMax: number;
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
  tools: {
    x: number;
    y: number;
    offset: number;
  };
};

export enum GameMode {
  "Play",
  "Editor",
  "Endless",
}

export type GameSceneData = {
  mode: GameMode;
  levelData: LevelData;
  levelKey?: string;
  endlessOptions?: EndlessOptions;
};

export type GameStates = {
  levelKey: string;
  turns: number;
  state: GameStatus;
  targetColor: ColorType;
  selectedColor: ColorType;
  remains: number;
  availableColors: Set<ColorType>;
  selectedTool: Tools;
  availableTools: [number, number, number];
  initialState: {
    turns: number;
    remains: number;
  };
  endlessOptions?: EndlessOptions;
  mode: GameMode;
};

export type CellAction = (x: number, y: number, color: ColorType) => void;

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
