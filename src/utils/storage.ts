import { Scene } from "phaser";
import { LanguageConfig } from "../types";

export const getLocal = (scene: Scene): LanguageConfig => {
  const defaultLang = "en";
  const jsonData = scene.cache.json.get("localization");
  const savedLang = localStorage.getItem("lang") ?? defaultLang;
  return jsonData.langs[savedLang];
};

export const getUserLevelsCleared = (): Map<string, object> => {
  const localData = localStorage.getItem("levels.cleared");
  return localData ? new Map(JSON.parse(localData)) : new Map();
};
