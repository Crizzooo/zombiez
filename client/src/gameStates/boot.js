

export default class BootState extends Phaser.State {
  init (players, level_file, next_state, extra_parameters) {
      //TODO: We may want to revisit these
      // ZG.scale.pageAlignHorizontally = true;
      // ZG.scale.pageAlignVertically = true;
      this.stage.backgroundColor = '#da2dc3';
      this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      this.physics.startSystem(Phaser.Physics.ARCADE);

      //game.players initiated with client lobby ovjects!
      this.game.players = players;
      console.log("this.game.players: ", this.game.players);
  }

  preload () {
      this.load.image('preloadbar', 'assets/images/preloader-bar.png');
  }

  create () {
      this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadbar', 0);
      this.preloadBar.anchor.setTo(0.5);
      this.preloadBar.scale.setTo(5);
  }

  update () {
    this.state.start("PreloadState");
  }
}
