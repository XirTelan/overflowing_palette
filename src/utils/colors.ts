import { ColorConfig, ColorType, Vector3 } from "../types";
import Phaser from "phaser";

export const normalizedRgbToHexString = (color: Vector3): string => {
  return Phaser.Display.Color.RGBToString(
    Math.floor(color.x * 255),
    Math.floor(color.y * 255),
    Math.floor(color.z * 255)
  );
};

export const normalizedRgbToColor = (color: Vector3): number => {
  return Phaser.Display.Color.GetColor(
    Math.floor(color.x * 255),
    Math.floor(color.y * 255),
    Math.floor(color.z * 255)
  );
};

export function cycleThroughColors(value: number, curTarget: ColorType) {
  const maxValue = Math.floor((Object.keys(ColorType).length - 1) / 2);
  return (((curTarget + value) % maxValue) + maxValue) % maxValue;
}
export function getColorName(indx: number, colors: ColorConfig) {
  const str = colors[indx as ColorType].colorName;
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
