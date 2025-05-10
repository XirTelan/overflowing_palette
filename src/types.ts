import { RATES } from "./utils";

export enum ColorType {
  "block" = -1,
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
  "none" = -1,
  "All",
  "Horizontal",
  "Vertical",
}
export type Position = [number, number];

export type Portal = {
  pair: [Position, Position];
  // color?: string;
};

export type TimedCell = { pos: Position; color: number; turns: number };

export type LevelData = {
  board: number[][];
  targetColor: number;
  turns: number;
  author?: string;
  tools?: [number, number, number];
  portals?: Portal[];
  timed?: TimedCell[];
};

export type LevelEntry = {
  id: string;
  folderName: string;
  categoryName: string;
  levelData: LevelData;
};

export type LevelsJson = LevelEntry[];

export type LevelDifficulty = keyof typeof RATES;

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
    empty: string;
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
      sound: string;
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
    soundTab: {
      folderName: string;
      master: string;
      sfx: string;
      bgm: string;
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
  [key: string]: {
    key: string;
    name: string;
    path: string;
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
    transitionDefault: number;
    transitionMinimum: number;
    transitionMax: number;
  };
  sound: {
    master: number;
    bgm: number;
    sfx: number;
  };
  background: BackgroundConfig;
  colors: ColorConfig;
  shaders: {
    base: { init: Record<string, unknown> };
  };
  mainMenu: MainMenuConfig;
  game: {
    gridOptions: GridOptions;
    ui: UiOptions;
  };
};

type MainMenuConfig = {
  levelSelection: {
    selectedLevelInfo: {
      previewBlock: {
        width: number;
        height: number;
        cellSize: number;
      };
      infoBlock: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      turnsTextOffset: {
        x: number;
        y: number;
      };
      targetColorTextOffset: {
        x: number;
        y: number;
      };
      defaultStyle: {
        color: string;
        font: string;
      };
      emptyText: {
        y: number;
        style: {
          color: string;
          font: string;
        };
      };
    };
  };
  levelEditor: {
    defaultStyle: {
      color: string;
      font: string;
    };
  };
  buttonsBlock: {
    x: number;
    y: number;
    gap: number;
  };
  menuBtn: {
    btn: {
      offset: number;
    };
    text: {
      x: number;
      y: number;
      style: {
        color: string;
        font: string;
        align: string;
      };
    };
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
export type ToolOption = {
  textureKey: string;
  textKey: string;
  hotkey: string;
  props: Record<string, any>;
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
    options: ToolOption[];
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

export type CellAction = (x: number, y: number) => void;

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
