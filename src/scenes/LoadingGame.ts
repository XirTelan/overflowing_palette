export class LoadingGame extends Phaser.Scene {
  constructor() {
    super("LoadingGame");
  }

  create(data: unknown extends object ? object : any) {
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Loading...",
        {
          fontSize: "32px",
          color: "#fff",
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(100, () => {
      this.scene.start("Game", data);
    });
  }
}
