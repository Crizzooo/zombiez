

export default class BootState extends Phaser.State {
  init(levelFile, players, nextState, extraParameters) {
    //TODO: We may want to revisit these
    // ZG.scale.pageAlignHorizontally = true;
    // ZG.scale.pageAlignVertically = true;
    //this.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    //Load Level Data from Level File JSON
    this.levelFile = levelFile;
    this.nextState = nextState;

    //TODO: make a decision here
    //ZG.players = players;
    this.players = players;
  }

  preload() {
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');

    //Load Level Data from Level File JSON
    this.load.text("level1", this.levelFile);
  }

  create() {
    //Create level
    let levelText, levelData;
    levelText = this.game.cache.getText("level1");
    levelData = JSON.parse(levelText);

    //Add loading bar
    this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadbar', 0);
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(5);

    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Start next state
    this.state.start('PreloadState', true, false, levelData);
  }
}



