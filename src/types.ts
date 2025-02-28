export enum ColorType {
  "red",
  "green",
  "blue",
  "yellow",
}

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
