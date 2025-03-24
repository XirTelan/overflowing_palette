import { Scene } from "phaser";
import { LanguageConfig } from "../types";

const DEFAULT_LANG = "en";

export const getLocal = (scene: Scene): LanguageConfig => {
  const jsonData = scene.cache.json.get("localization");
  const savedLang = getLangCode();
  return jsonData.langs[savedLang];
};

export const getLangCode = () => {
  return localStorage.getItem("lang") ?? DEFAULT_LANG;
};

export const getUserLevelsCleared = (): Map<string, object> => {
  const localData = localStorage.getItem("levels.cleared");
  return localData ? new Map(JSON.parse(localData)) : new Map();
};
