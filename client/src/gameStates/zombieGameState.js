const R = require('ramda');
const throttle = require('lodash.throttle');

import TiledState from './tiledState';

export default class ZombieGameState extends TiledState {
  constructor (game) {
    super(game);
  }

  init (levelData) {
    //set constants for game
    ZG.RUNNING_SPEED = 180;

    //Call super init to load in data;
    super.init.call(this, levelData)

    //Make pixels crisp
    this.stage.smoothed = false;

  }

  preload () {
      //load assets that are specific for this mini game
  }

  create () {
    //Create game set up through tiled state by calling super
    super.create.call(this);
  }

  update () {
    //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB
    //this.handleInput();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Non Phaser Methods

  loadLevel () {
    // ZG.gameBackground = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'snowLandscape');
    // ZG.gameBackground.scale.setTo(0.9, 0.9);
    // ZG.gameBackground.anchor.setTo(0.5);

    //resize the world to fit the layer
    //this.world.resize(570, 550);


    //for each player in lobby, create a player sprite
    // ZG.playerSprites = ZG.players.map( (playerObj, index) => {
    //   console.log('player created for: ', playerObj);
    //   let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';
    //   let playerSprite = this.add.sprite(this.world.centerX + 15*index, this.world.centerY + 15*index, spriteKey);
    //   this.physics.arcade.enable(playerSprite);
    //   //determine if client is currently a player, and assign his sprite to currentPlayer object
    //   if (socket.id === playerObj.socketId) {
    //       ZG.currentPlayer = playerSprite;
    //   }
    // });
  };

  handleInput() {
    // if (ZG.currentPlayer){
    //   ZG.currentPlayer.body.velocity.x = 0;
    //   ZG.currentPlayer.body.velocity.y = 0;
    //   if (this.cursors.left.isDown){
    //       ZG.currentPlayer.body.velocity.x = -ZG.RUNNING_SPEED;
    //   }
    //   if (this.cursors.right.isDown){
    //       ZG.currentPlayer.body.velocity.x = ZG.RUNNING_SPEED;
    //   }
    //   if (this.cursors.up.isDown){
    //       ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
    //   }
    //   if (this.cursors.down.isDown){
    //       ZG.currentPlayer.body.velocity.y = ZG.RUNNING_SPEED;
    //   }
    // }
  }

}












