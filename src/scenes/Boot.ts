import { Scene } from "phaser";
import { ColorConfig, GameConfig, Vector2 } from "../types";
import { LoadingScreen } from "../classes/ui/LoadingScreen";
import {
  getConfig,
  getLangCode,
  getLocal,
  loadingShaderInitConfig,
} from "../utils";

export class Boot extends Scene {
  constructor() {
    super({
      key: "Boot",
      pack: {
        files: [
          {
            type: "glsl",
            key: "loading",
            url: "assets/shaders/loading.glsl",
          },
          {
            type: "image",
            key: "cellMask",
            url: "assets/textures/shaders/cellMask.png",
          },
          {
            type: "image",
            key: "celltexture",
            url: "assets/textures/shaders/celltexture.webp",
          },
          {
            type: "image",
            key: "cellnoise",
            url: "assets/textures/shaders/cellnoise.webp",
          },
          {
            type: "json",
            key: "langs",
            url: "assets/data/langs.json",
          },
        ],
      },
    });
  }
  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const baseShader = this.cache.shader.get("loading");
    baseShader.uniforms = {
      ...loadingShaderInitConfig,
      screenResolution: { type: "2f", value: { x: width, y: height } },
    };
    this.loadLocalization();

    this.showLoading();

    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.load.pack("assets_pack", "assets/data/assets.json");
    if (!this.cache.json.exists("config")) {
      this.load.json("config", "assets/data/config.json");
    }
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.loadDefaultLocalColors();

    this.loadUserConfig("colors", isValidColors);
    this.loadUserConfig("background");
    this.loadUserConfig("gameplay");

    this.initShaderConfig({ x: width, y: height });

    const isProduction = import.meta.env.PROD;
    if (!isProduction) {
      const debugConfig = localStorage.getItem("overflowingPalette_debug");
      if (debugConfig) {
        const data = JSON.parse(debugConfig);
        if (data.mode != -1) {
          this.scene.start("LoadingGame", {
            ...data,
          });
          return;
        }
      }
    }

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start("MainMenu");
    });
  }

  private loadLocalization() {
    this.cache.json.remove("localization");
    const langs = this.cache.json.get("langs");

    const lang = getLangCode();
    this.load.json("localization", langs[lang].path);
  }

  private loadDefaultLocalColors() {
    const config = getConfig(this);
    const local = getLocal(this);

    config.colors = Object.fromEntries(
      Object.entries(config.colors).map(([key, color]) => [
        key,
        {
          ...color,
          colorName: local.colors[Number(key)],
        },
      ])
    ) as ColorConfig;
  }

  initShaderConfig(resolution: Vector2) {
    const cache = this.cache;
    const baseShader = cache.shader.get("base");
    const { shaders, gameplay } = getConfig(this);

    baseShader.uniforms = {
      ...shaders.base.init,
      lightenFactor: {
        type: "1f",
        value: gameplay.fluidColors ? 0.2 : 1.0,
      },
      activeOffset: {
        type: "2f",
        value: { x: gameplay.highlightIntensity ? 0.0 : 0.4, y: 0.7 },
      },
      screenResolution: { type: "2f", value: resolution },
    };

    const distortionShader = cache.shader.get("distortion");

    distortionShader.uniforms = {
      ...distortionShader.uniforms,
      darkOverlay: { type: "1f", value: 0.7 },
      radius: { type: "1f", value: 0.3 },
    };
  }

  loadUserConfig<T>(
    key: keyof GameConfig,
    check?: (data: unknown) => data is T
  ) {
    const config =  getConfig(this)
    const storageData = localStorage.getItem(key);
    if (!storageData) return;

    const parsedData = JSON.parse(storageData);

    if (check && !check(parsedData)) return;

    config[key] = {
      ...config[key],
      ...parsedData,
    };
  }

  showLoading() {
    const scene = this;
    const load = this.load;

    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const loadingScreen = new LoadingScreen(this);

    const percentText = scene.make.text({
      x: width / 2,
      y: height - 150,
      text: "0%",
      style: {
        font: "2rem cinzel",
        color: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = scene.make.text({
      x: width / 2,
      y: height - 100,
      text: "",
      style: {
        font: "2rem cinzel",
        color: "#ffffff",
      },
    });
    assetText.setOrigin(0.5, 0.5);

    loadingScreen.bgShader.setUniform("transition.value", -0.1);
    loadingScreen.textShader.setUniform("transition.value", -0.1);

    load.on("progress", function (value: number) {
      percentText.setText(`${value * 100} %`);

      loadingScreen.bgShader.setUniform("transition.value", value);
      loadingScreen.textShader.setUniform("transition.value", value);
    });

    load.on("fileprogress", function (file: Phaser.Loader.File) {
      assetText.setText(`Loading asset: ${file.src}`);
    });
    load.on("complete", () => {
      loadingScreen.bgShader.setUniform("transition.value", 1.1);
      loadingScreen.textShader.setUniform("transition.value", 1.1);
    });
  }
}

const isValidColors = (colors: unknown): colors is ColorConfig => {
  if (typeof colors != "object" || colors === null) return false;

  return Object.entries(colors)?.every(([, value]) => {
    return (
      typeof value === "object" &&
      value != null &&
      "colorName" in value &&
      "value" in value
    );
  });
};
