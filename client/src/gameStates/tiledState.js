/**
 * Created by CharlieShi on 3/16/17.
 */

//Use this to load map
//Loads physics engine, scales canvas size etc...

import Player from '../prefabs/player'

export default class TiledState extends Phaser.State {
  constructor (game) {
    super(game);

    this.prefabs = {};

    this.prefabClasses = {
      "player": Player.prototype.constructor
    }
  }

  init (levelData) {
    this.levelData = levelData;

    //Scaling the Game Window for a pixelated effect
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(8, 8, 1000, 1000);
    //this.game.scale.setUserScale(2, 2, 200, 200);
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
      this.map.addTilesetImage(tileset.name, levelData.map.tilesets[tilesetIndex]);
      tilesetIndex += 1;
    }, this);

  }

  createPrefab (prefabName, prefabData, position) {
    let prefab;

    console.log("prefab created", prefabName)

    //Pass prefab data into the constructor of that type defined in this constructor
    if (this.prefabClasses.hasOwnProperty(prefabData.type)) {
      prefab = new this.prefabClasses[prefabData.type](this, prefabName, position, prefabData.properties);
    }

    this.prefabs[prefabName] = prefab;

    return prefab;
  }

  create () {
    let groupName, objectLayer, collisionTiles, worldGrid, tileDimensions, prefabName;

    this.layers = {};
    this.groups = {};

    //Go through all groups in the level data
    //Add group to game state
    this.levelData.groups.forEach( (groupName) => {
      this.groups[groupName] = this.game.add.group();
    });

    //Go through all map layers
    //Also set collision if collision is true
    this.map.layers.forEach( (layer) => {
      this.layers[layer.name] = this.map.createLayer(layer.name);

      if (layer.properties.collision) {
        this.map.setCollisionByExclusion([], true, layer.name);
      }
    });

    console.log('all map layers', this.map.layers);

  }

}