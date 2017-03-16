



const init = () => {
  PB.game.stage.backgroundColor = '#da2dc3';
  PB.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  //TODO: We may want to revisit these
  // PB.scale.pageAlignHorizontally = true;
  // PB.scale.pageAlignVertically = true;
  PB.game.physics.startSystem(Phaser.Physics.ARCADE);
}

const preload = () => {
  PB.game.load.image('preloadbar', 'assets/images/preloader-bar.png');
}

const create = function() {
  PB.game.preloadBar = PB.game.add.sprite(PB.game.world.centerX, PB.game.world.centerY, 'preloadbar', 0);
  PB.game.preloadBar.anchor.setTo(0.5);
  PB.game.preloadBar.scale.setTo(5);
  PB.game.cursors = PB.game.input.keyboard.createCursorKeys();
  PB.game.cursors.spacebar = PB.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}
const update = () => {
  PB.game.state.start('Preload');
}

const BootState = {
  init,
  preload,
  create,
  update
};

export default BootState;
