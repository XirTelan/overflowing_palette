import { ColorType, Vector3 } from "./types";

export const colors: Record<ColorType, Vector3> = {
  [ColorType.red]: { x: 0.682, y: 0.298, z: 0.294 },
  [ColorType.green]: { x: 0.357, y: 0.604, z: 0.498 },
  [ColorType.blue]: { x: 0.353, y: 0.561, z: 0.706 },
  [ColorType.yellow]: { x: 0.839, y: 0.761, z: 0.51 },
};

export const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
