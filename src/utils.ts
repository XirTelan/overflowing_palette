import { ColorType, Vector3 } from "./types";

export const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const NormalizedRgbToHexString = (color: Vector3) => {
  return Phaser.Display.Color.RGBToString(
    color.x * 255,
    color.y * 255,
    color.z * 255
  );
};

export const NormalizedRgbToColor = (color: Vector3) => {
  return Phaser.Display.Color.GetColor(
    color.x * 255,
    color.y * 255,
    color.z * 255
  );
};

export function cicleThrougColors(value: number, curTarget: ColorType) {
  const maxValue = Object.keys(ColorType).length / 2;
  return (((curTarget + value) % maxValue) + maxValue) % maxValue;
}
export function getColorName(indx: number) {
  const str = ColorType[indx];
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
