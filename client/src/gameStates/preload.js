

export default class Preload extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#7c79fa';
  }

  preload () {
      //load assets that are used across all games

      //Preload Bar
      this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadbar', 0);
      this.preloadBar.anchor.setTo(0.5);
      this.preloadBar.scale.setTo(5);

      //Other Sprites
      this.load.setPreloadSprite(this.preloadBar);


      //Atlases for Player Character
      this.load.atlasXML('blueGunGuy', '../../assets/images/blueGunGuyAtlas.png', '../../assets/images/blueGunGuyAtlasXML.xml');
      this.load.atlasXML('greenGunGuy', '../../assets/images/greenGunGuyAtlas.png', '../../assets/images/greenGunGuyAtlasXML.xml');
  }

  create () {
      this.state.start('ZombieGameState', true, false);
  }
}



