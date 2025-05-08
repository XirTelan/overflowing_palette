export const FADE_DELAY = 150;

export const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const RATES = {
  0: 0.7,
  1: 0.5,
  2: 0.3,
  3: 0.1,
};

export const localStoragePrefix = "overflowingPalette_";

export const loadingShaderInitConfig = {
  color: { type: "3f", value: { x: 0, y: 0, z: 0 } },
  colorToTransform: { type: "3f", value: { x: 1, y: 1, z: 1 } },
  textureResolution: { type: "2f", value: { x: 512, y: 512 } },
  isSimple: { type: "1f", value: 0.0 },
  transition: { type: "1f", value: 0.0 },
  active: { type: "1f", value: 0.0 },
};
