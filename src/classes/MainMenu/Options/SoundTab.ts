import { Scene } from "phaser";
import { OptionTab } from "./OptionTab";
import { RangeSlider } from "@/classes/ui/html/RangeSlider";
import { OptionFolder } from "@/classes/ui/html/OptionFolder";
import { getLocal } from "@/utils";
import { AudioManager } from "@/classes/common/AudioManager";

export class SoundTab extends OptionTab {
  constructor(
    scene: Scene,
    key: string,
    isActive: boolean,
    btnText: string,
    btnContainer: HTMLDivElement,
    tabsContainer: HTMLDivElement,
    callback: (key: string) => void,

    context: object
  ) {
    super(
      key,
      isActive,
      btnText,
      btnContainer,
      tabsContainer,
      callback,
      context
    );

    const { soundTab } = getLocal(scene)["options"];

    const folder = new OptionFolder(soundTab.folderName);
    const audioManager: AudioManager = scene.registry.get("audioManager");
    console.log(audioManager);

    const master = Math.round(audioManager.getMasterVolume() * 100);
    const bgm = Math.round(audioManager.getBGMVolume() * 100);
    const sfx = Math.round(audioManager.getSFXVolume() * 100);

    const overallLevel = new RangeSlider(
      soundTab.master,
      master,
      0,
      100,
      (val) => {
        audioManager.setMasterVolume(val / 100);
      }
    );
    const musicLevel = new RangeSlider(soundTab.bgm, bgm, 0, 100, (val) => {
      audioManager.setBGMVolume(val / 100);
    });
    const sfxLevel = new RangeSlider(soundTab.sfx, sfx, 0, 100, (val) => {
      audioManager.setSFXVolume(val / 100);
    });

    folder.add(overallLevel.container);
    folder.add(musicLevel.container);
    folder.add(sfxLevel.container);
    this.tab.appendChild(folder.container);
  }
}
