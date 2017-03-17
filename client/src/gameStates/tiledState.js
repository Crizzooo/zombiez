/**
 * Created by CharlieShi on 3/16/17.
 */

//Use this to load map

export default class TiledState extends Phaser.State {
  constructor (game) {
    super(game);


  }

  init (levelData) {
    this.levelData = levelData;

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 0;

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

    this.layers[this.map.layer.name].resizeWorld();

  }


}