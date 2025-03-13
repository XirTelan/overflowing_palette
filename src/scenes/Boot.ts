import { Scene } from "phaser";
import { ColorConfig, LoadingConfig, Vector2 } from "../types";
import { LoadingScreen } from "../classes/ui/LoadingScreen";
import { loadingShaderInitConfig } from "../utils";

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
            url: "assets/textures/shaders/celltexture.png",
          },
          {
            type: "image",
            key: "cellnoise",
            url: "assets/textures/shaders/cellnoise.png",
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

    this.showLoading();

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.load.pack("assets_pack", "assets/data/assets.json");
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.initShaderConfig({ x: width, y: height });
    this.loadUserConfig();

    const isProduction = import.meta.env.PROD;
    if (!isProduction) {
      const debugConfig = localStorage.getItem("debug");
      console.log("debugConfig", debugConfig);
      if (debugConfig) {
        const data = JSON.parse(debugConfig);
        if (data.mode != "none") {
          console.log("wtf");
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

  initShaderConfig(resolution: Vector2) {
    const cache = this.cache;
    const baseShader = cache.shader.get("base");
    const { shaders } = cache.json.get("config");
    baseShader.uniforms = {
      ...shaders.base.init,
      screenResolution: { type: "2f", value: resolution },
    };

    const distortionShader = cache.shader.get("distortion");
    console.log(distortionShader);
    distortionShader.uniforms = {
      ...distortionShader.uniforms,
      darkOverlay: { type: "1f", value: 0.7 },
    };
  }

  loadUserConfig() {
    const config: { colors: ColorConfig } = this.cache.json.get("config");

    this.loadShaderUserConfig(["activeOffset", "lightenFactor"]);

    const savedColors = localStorage.getItem("colors");

    if (!savedColors) return;

    const parsedData = JSON.parse(savedColors);

    if (!isValidColors(parsedData)) return;

    config.colors = {
      ...config.colors,
      ...parsedData,
    };
  }

  loadShaderUserConfig(keys: string[]) {
    const config = this.cache.json.get("config");
    keys.forEach((key) => {
      const data = localStorage.getItem(`shader.${key}`);
      if (data) {
        config.shaders.base.init = {
          ...config.shaders.base.init,
          [key]: JSON.parse(data),
        };
      }
    });
  }

  showLoading(loadingConfig: LoadingConfig = defaultLoadingConfig) {
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

const defaultLoadingConfig: LoadingConfig = {
  width: 300,
  boxPadding: 10,
  height: 30,
};

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
