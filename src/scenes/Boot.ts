import { Scene } from "phaser";
import { LoadingConfig } from "../types";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    this.showLoading();
    this.load.pack("assets_pack", "assets/data/assets.json");
  }
  create() {
    this.loadUserConfig();
    const isProduction = import.meta.env.PROD;
    if (!isProduction) {
      const debugConfig = localStorage.getItem("debug");
      if (debugConfig) {
        const data = JSON.parse(debugConfig);
        if (data.mode != "none") {
          this.scene.start("LoadingGame", {
            ...data,
          });
          return;
        }
      }
    }
    this.scene.start("MainMenu");
  }

  loadUserConfig() {
    const config = this.cache.json.get("config");

    this.loadShaderUserConfig(["activeOffset", "lightenFactor"]);

    const colors = localStorage.getItem("colors");
    if (colors) {
      config.colors = {
        ...config.colors,
        ...JSON.parse(colors),
      };
    }
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

    const progressBar = scene.add.graphics();
    const progressBox = scene.add.graphics();

    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    progressBox.fillStyle(0x222222, 0.7);
    progressBox.fillRect(
      width / 2 - (loadingConfig.width + loadingConfig.boxPadding) / 2,
      height / 2 - (loadingConfig.height + loadingConfig.boxPadding) / 2,
      loadingConfig.width + loadingConfig.boxPadding,
      loadingConfig.height + loadingConfig.boxPadding
    );

    const loadingText = scene.make.text({
      x: width / 2,
      y: height / 2 - loadingConfig.height - loadingConfig.boxPadding,
      text: "Loading...",
      style: {
        font: "20px monospace",
        color: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = scene.make.text({
      x: width / 2,
      y: height / 2,
      text: "0%",
      style: {
        font: "18px monospace",
        color: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = scene.make.text({
      x: width / 2,
      y: height / 2 + loadingConfig.height + loadingConfig.boxPadding,
      text: "",
      style: {
        font: "18px monospace",
        color: "#ffffff",
      },
    });
    assetText.setOrigin(0.5, 0.5);

    load.on("progress", function (value: number) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 2 - loadingConfig.width / 2,
        height / 2 - loadingConfig.height / 2,
        loadingConfig.width * value,
        loadingConfig.height
      );
      percentText.setText(`${value * 100} %`);
    });

    load.on("fileprogress", function (file: Phaser.Loader.File) {
      assetText.setText(`Loading asset: ${file.src}`);
    });
    load.on("complete", function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
  }
}

const defaultLoadingConfig: LoadingConfig = {
  width: 300,
  boxPadding: 10,
  height: 30,
};
