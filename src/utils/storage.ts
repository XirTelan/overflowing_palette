import { Scene } from "phaser";
import { GameConfig, LanguageConfig } from "../types";
import { localStoragePrefix } from "./constants";

const DEFAULT_LANG = "en";

export const getLocal = (scene: Scene): LanguageConfig => {
  return scene.cache.json.get("localization");
};

export const getConfig = (scene: Scene): GameConfig => {
  return scene.cache.json.get("config");
};

export const getLangCode = () => {
  return localStorage.getItem("lang") ?? DEFAULT_LANG;
};

export const getUserLevelsCleared = (): Map<string, object> => {
  const localData = localStorage.getItem(`${localStoragePrefix}levels.cleared`);
  return localData ? new Map(JSON.parse(localData)) : new Map();
};
