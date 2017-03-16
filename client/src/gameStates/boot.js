



const init = (players) => {
  ZG.game.stage.backgroundColor = '#da2dc3';
  ZG.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  //TODO: We may want to revisit these
  // ZG.scale.pageAlignHorizontally = true;
  // ZG.scale.pageAlignVertically = true;
  ZG.game.physics.startSystem(Phaser.Physics.ARCADE);

  ZG.players = players;
}

const preload = () => {
  ZG.game.load.image('preloadbar', 'assets/images/preloader-bar.png');
}

const create = function() {
  ZG.game.preloadBar = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'preloadbar', 0);
  ZG.game.preloadBar.anchor.setTo(0.5);
  ZG.game.preloadBar.scale.setTo(5);

  //Control Mechanics
  ZG.game.cursors = ZG.game.input.keyboard.createCursorKeys();
  ZG.game.cursors.spacebar = ZG.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}
const update = () => {
  ZG.game.state.start('Preload');
}

const BootState = {
  init,
  preload,
  create,
  update
};

export default BootState;
