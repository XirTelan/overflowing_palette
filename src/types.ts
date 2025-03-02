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
