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

export const loadingShaderInitConfig = {
  color: { type: "3f", value: { x: 0, y: 0, z: 0 } },
  colorToTransform: { type: "3f", value: { x: 1, y: 1, z: 1 } },
  textureResolution: { type: "2f", value: { x: 512, y: 512 } },
  isSimple: { type: "1f", value: 0.0 },
  transition: { type: "1f", value: 0.0 },
  active: { type: "1f", value: 0.0 },
};

export const availableTools = {
  1: {
    textureKey: "swapAll",
    textKey: "allwaySwap",
    hotkey: "Q",
    props: {},
  },
  2: {
    textureKey: "swapLine",
    hotkey: "W",
    textKey: "verticalSwap",
    props: {
      rotation: 1.5708,
    },
  },
  3: {
    textureKey: "swapLine",
    textKey: "horizontalSwap",
    hotkey: "E",
    props: {},
  },
};
