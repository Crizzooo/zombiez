/**
 * Created by CharlieShi on 3/16/17.
 */

//Use this to load map
//Loads physics engine, scales canvas size etc...

export default class TiledState extends Phaser.State {
  constructor (game) {
    super(game);
  }

  init (levelData) {
    this.levelData = levelData;

    //Scaling the Game Window for a pixelated effect
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(8, 8, 1000, 1000);
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Create tilemap base on level data
    this.map = this.game.add.tilemap(levelData.map.key);
    let tilesetIndex = 0;

    this.map.tilesets.forEach(function (tileset) {
      console.log('inside tileset image creation', tileset)
      this.map.addTilesetImage(tileset.name, levelData.map.tilesets[tilesetIndex]);
      tilesetIndex += 1;
    }, this);
  }

  create () {
    let group_name, object_layer, collision_tiles, world_grid, tile_dimensions, prefab_name;

    this.layers = {};

    //Go through all map layers
    //Also set collision if collision is true
    this.map.layers.forEach(function (layer) {
      this.layers[layer.name] = this.map.createLayer(layer.name);
      if (layer.properties.collision) {
        this.map.setCollisionByExclusion([-1], true, layer.name);
      }
    }, this);

    //Not sure if we need this?
    //this.layers[this.map.layer.name].resizeWorld();

  }


}