import { localStoragePrefix } from "@/utils";
import { Scene, Sound } from "phaser";

type SoundConfig = {
  master: number;
  bgm: number;
  sfx: number;
};

export class AudioManager {
  private scene: Scene;
  private bgm?:
    | Sound.NoAudioSound
    | Sound.HTML5AudioSound
    | Sound.WebAudioSound;
  private masterVolume = 1;
  private sfxVolume = 1;
  private bgmVolume = 1;

  constructor(scene: Scene) {
    this.scene = scene;
    this.loadFromLocalStorage();
    if (this.bgmVolume > 0) {
      this.playBGM("bg1");
    }
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(`${localStoragePrefix}sound`);
    if (!stored) return;
    try {
      const { master, bgm, sfx } = JSON.parse(stored) as SoundConfig;
      this.masterVolume = master;
      this.sfxVolume = sfx;
      this.bgmVolume = bgm;
    } catch {
      console.warn("Failed to parse sound settings from localStorage.");
    }
  }

  private saveToLocalStorage(): void {
    const config: SoundConfig = {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      bgm: this.bgmVolume,
    };
    localStorage.setItem(`${localStoragePrefix}sound`, JSON.stringify(config));
  }

  playSFX(key: string, config: Phaser.Types.Sound.SoundConfig = {}): boolean {
    return this.scene.sound.play(key, {
      ...config,
      volume: (config.volume ?? 1) * this.sfxVolume * this.masterVolume,
    });
  }

  playBGM(key: string, config: Phaser.Types.Sound.SoundConfig = {}): void {
    if (this.bgm) this.bgm.stop();

    this.bgm = this.scene.sound.add(key, {
      loop: true,
      ...config,
      volume: (config.volume ?? 1) * this.bgmVolume * this.masterVolume,
    });

    this.bgm.play();
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = vol;
    this.saveToLocalStorage();
    this.updateBGMVolume();
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = vol;
    this.saveToLocalStorage();
  }

  setBGMVolume(vol: number): void {
    this.bgmVolume = vol;
    this.saveToLocalStorage();
    this.updateBGMVolume();
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  setScene(scene: Scene) {
    this.scene = scene;
    return this;
  }

  private updateBGMVolume(): void {
    if (this.bgm?.isPlaying) {
      this.bgm.setVolume(this.bgmVolume * this.masterVolume);
    }
  }
}
