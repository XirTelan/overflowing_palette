import { ColorType, Vector3 } from "./types";

export const colors: Record<ColorType, Vector3> = {
  [ColorType.red]: { x: 0.914, y: 0.302, z: 0.275 },
  [ColorType.green]: { x: 0.357, y: 0.604, z: 0.498 },
  [ColorType.blue]: { x: 0.451, y: 0.682, z: 0.808 },
  [ColorType.yellow]: { x: 0.969, y: 0.961, z: 0.549 },
  [ColorType.purple]: { x: 0.69, y: 0.082, z: 0.761 },
  [ColorType.cyan]: { x: 0.027, y: 0.922, z: 0.859 },
};

export const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
