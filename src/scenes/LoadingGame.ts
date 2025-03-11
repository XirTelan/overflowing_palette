import { LoadingScreen } from "../classes/ui/LoadingScreen";

export class LoadingGame extends Phaser.Scene {
  constructor() {
    super("LoadingGame");
  }

  create(data: unknown extends object ? object : any) {
    new LoadingScreen(this);

    this.time.delayedCall(100, () => {
      this.scene.start("Game", data);
    });
  }
}
