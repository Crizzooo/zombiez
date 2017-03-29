/**
 * Created by CharlieShi on 3/16/17.
 */

//Use this to load map
//Loads physics engine, scales canvas size etc...

import Player from '../prefabs/player';
import Enemy from '../prefabs/enemy';
import Gun from '../prefabs/gun'

var self;
export default class TiledState extends Phaser.State {
    constructor(game) {
        super(game);

        this.prefabs = {};

        this.prefabClasses = {
            "player": Player.prototype.constructor,
            "enemies": Enemy.prototype.constructor,
            "guns": Gun.prototype.constructor
        }

        self = this;
    }

    init(levelData) {
      this.levelData = levelData;

	    //Set camera to follow, then make world big to allow camera to pan off
	    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
	    this.game.world.setBounds(0, 0, 1600, 1600);
	    //Scaling the Game Window for a pixelated effect
	    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
	    this.game.scale.setGameSize($('#game').innerWidth()/2.1, $('#game').innerHeight()/2.1);
	    this.game.scale.setUserScale(2.1, 2.1);

      this.game.stage.disableVisibilityChange = true;

      this.game.time.advancedTiming = true;
      this.game.desiredFps = 30;


	    //this.game.renderer.renderSession.roundPixels = true;
	    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
	    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST

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

  create() {
    let groupName, objectLayer, collisionTiles, worldGrid, tileDimensions, prefabName;

    this.layers = {};
    this.groups = {};

    //Go through all groups in the level data
    //Add group to game state
    this.levelData.groups.forEach((groupName) => {
        this.groups[groupName] = this.game.add.group();
	      this.groups[groupName].pushToOverlay = true;
    });

    //Go through all map layers
    //Also set collision if collision is true
    this.map.layers.forEach((layer) => {

      this.layers[layer.name] = this.map.createLayer(layer.name);

      if (layer.properties.collision) {
      	console.log('collision layer', layer.name);
        this.map.setCollisionByExclusion([], true, layer.name);
      }
    });

  }

	//Use this method to create prefabs
	createPrefab(prefabName, prefabData, position) {
		let prefab;

    console.log('self in createPrefab', self);
		//Pass prefab data into the constructor of that type defined in this constructor
		if (self.prefabClasses.hasOwnProperty(prefabData.type)) {
			prefab = new self.prefabClasses[prefabData.type](self, prefabName, position, prefabData.properties);
		}

		self.prefabs[prefabName] = prefab;

		return prefab;
	}

	//This creates the obstacles pathfinding will need to path around
	createWorldGrid () {
		let litObstaclesLayer, obstaclesLayer, rowIndex, columnIndex, worldGrid;

		console.log('layers',this.map.layers)
		obstaclesLayer = this.map.layers[1];
    litObstaclesLayer = this.map.layers[2];
		worldGrid = [];
		for (rowIndex = 0; rowIndex < this.map.height; rowIndex += 1) {
			worldGrid.push([]);
			for (columnIndex = 0; columnIndex < this.map.width; columnIndex += 1) {
			  if (obstaclesLayer.data[rowIndex][columnIndex].collides || litObstaclesLayer.data[rowIndex][columnIndex].collides){
			  	//|| litObstaclesLayer.data[rowIndex][columnIndex].collides
          worldGrid[rowIndex].push(1);
			  	//worldGrid[rowIndex].push((obstaclesLayer.data[rowIndex][columnIndex].index));
        }
			}
		}

		return worldGrid;
	}
}
