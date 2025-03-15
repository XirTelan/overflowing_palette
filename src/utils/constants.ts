export const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const RATES = {
  Easy: 0.7,
  Medium: 0.5,
  Hard: 0.3,
  Mess: 0.1,
};

export const loadingShaderInitConfig = {
  color: { type: "3f", value: { x: 1, y: 1, z: 1 } },
  colorToTransform: { type: "3f", value: { x: 1, y: 1, z: 1 } },
  textureResolution: { type: "2f", value: { x: 512, y: 512 } },
  isSimple: { type: "1f", value: 0.0 },
  transition: { type: "1f", value: 0.0 },
  active: { type: "1f", value: 0.0 },
};
