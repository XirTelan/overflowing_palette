import { ColorType } from "../types";

export const cycleThroughColors = (
  value: number,
  curTarget: ColorType
): number => {
  const maxValue = Object.keys(ColorType).length / 2;
  return (((curTarget + value) % maxValue) + maxValue) % maxValue;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};
