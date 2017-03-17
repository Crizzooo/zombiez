

export default class Preload extends Phaser.State {
  init (levelData) {
    this.levelData = levelData;

    //this.stage.backgroundColor = '#7c79fa';
  }

  preload () {
    let assets, assetKey, asset;

    console.log(this.levelData);
    //Access assets object from level json
    assets = this.levelData.assets;

    // load assets according to asset key
    for (assetKey in assets) {
      if (assets.hasOwnProperty(assetKey)) {
        asset = assets[assetKey];
        switch (asset.type) {
          case "image":
            this.load.image(assetKey, asset.source);
            break;
          case "spritesheet":
            this.load.spritesheet(assetKey, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
            break;
          case "tilemap":
            this.load.tilemap(assetKey, asset.source, null, Phaser.Tilemap.TILED_JSON);
            break;
        }
      }
    }

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
      this.state.start('ZombieGameState', true, false, this.levelData);
  }
}



