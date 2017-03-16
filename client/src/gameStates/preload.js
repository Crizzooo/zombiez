



const init = () => {
  PB.game.stage.backgroundColor = '#7c79fa';
}

const preload = () => {
  //load assets that are used across all games

  //Preload Bar
  PB.game.preloadBar = PB.game.add.sprite(PB.game.world.centerX, PB.game.world.centerY, 'preloadbar', 0);
  PB.game.preloadBar.anchor.setTo(0.5);
  PB.game.preloadBar.scale.setTo(5);

  //Other Sprites
  PB.game.load.setPreloadSprite(PB.game.preloadBar);
  PB.game.load.image('iceBall', '../../assets/images/IceBall.png');
  PB.game.load.image('iceCube', '../../assets/images/iceCubeSprite.png');
  PB.game.load.image('star', '../../assets/images/starSprite.png');
  PB.game.load.image('snowLandscape', '../assets/images/snowLandscape.png');
  PB.game.load.image('smallIceRight', '../assets/images/smallIce1.png');
  PB.game.load.image('smallIceLeft', '../assets/images/smallIce2.png');

  //Atlases for Player Character
  PB.game.load.atlasXML('blueGunGuy', '../../assets/images/blueGunGuyAtlas.png', '../../assets/images/blueGunGuyAtlasXML.xml');
  PB.game.load.atlasXML('greenGunGuy', '../../assets/images/greenGunGuyAtlas.png', '../../assets/images/greenGunGuyAtlasXML.xml');
  PB.game.load.atlasXML('greyGunGuy', '../../assets/images/greyGunGuyAtlas.png', '../../assets/images/greyGunGuyAtlasXML.xml');
  PB.game.load.atlasXML('pinkGunGuy', '../../assets/images/pinkGunGuyAtlas.png', '../../assets/images/pinkGunGuyAtlasXML.xml');

  //load level releated assets
  // PB.game.load.image('gameTiles', '../../assets/images/tiles_spritesheet.png');
  // PB.game.load.tilemap('level1', '../../assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
}
const create = () => {
  //launch next game state;
  PB.game.state.start('ZombieGameState', true, false, 'Launching Zombie Game State!');
}
const update = () => {

}







const PreloadState = {
  init,
  preload,
  create,
  update
};

export default PreloadState;
