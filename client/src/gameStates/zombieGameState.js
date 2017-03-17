const R = require('ramda');
const throttle = require('lodash.throttle');

import Player from '../prefabs/player'

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
    //this.stage.smoothed = false;

  }

  preload () {

    let playerPrefab = this.createPrefab('player',
      { type: 'player',
        initial: 18,
      }, 0, 0)

    let playerSprite = ZG.game.add.sprite(this.game, ZG.game.world.centerX + 15 * index, ZG.game.world.centerY + 15 * index, spriteKey, 18);

    //for each player in lobby, create a player sprite
    ZG.playerSprites = ZG.players.map((playerObj, index) => {
      console.log('player created for: ', playerObj);
      let spriteKey = index % 2 === 0 ? 'playerSpriteSheet' : 'playerSpriteSheet';
      let playerSprite = ZG.game.add.sprite(ZG.game.world.centerX + 15 * index, ZG.game.world.centerY + 15 * index, spriteKey, 18);

      playerSprite.animations.add('right', [24, 8, 5, 20, 12, 13], 10, true);
      playerSprite.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
      playerSprite.animations.add('up', [16, 0, 14, 6, 1], 10, true);
      playerSprite.animations.add('down', [23, 9, 21, 22, 7, 4], 10, true);

      //determine if client is currently a player, and assign his sprite to currentPlayer object
      if (socket.id === playerObj.socketId) {
        ZG.currentPlayer = playerSprite;
      }
    });


  }

  create () {
    //Create game set up through tiled state by calling super
    super.create.call(this);
  }

  update () {

  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Non Phaser Methods

  handleInput () {
    if (ZG.currentPlayer) {
      ZG.currentPlayer.body.velocity.x = 0;
      ZG.currentPlayer.body.velocity.y = 0;
      // console.log("VELOCITY", ZG.currentPlayer.body.velocity.x, ZG.currentPlayer.body.velocity.y);
      if (ZG.game.cursors.left.isDown) {
        // if(playerStatus === '')
        ZG.currentPlayer.animations.play('right');
        ZG.currentPlayer.scale.setTo(-1, 1);
        ZG.currentPlayer.body.velocity.x = -ZG.RUNNING_SPEED;

        switch(ZG.currentPlayer.body.sprite._frame.name){
          case 'lookingRightRightLegUp.png':
            ZG.currentPlayer.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            ZG.currentPlayer.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            ZG.currentPlayer.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            ZG.currentPlayer.body.velocity.y -= 50
        }

      }
      if (ZG.game.cursors.right.isDown) {
        ZG.currentPlayer.scale.setTo(1, 1);
        ZG.currentPlayer.animations.play('right');
        ZG.currentPlayer.body.velocity.x = ZG.RUNNING_SPEED;
        switch(ZG.currentPlayer.body.sprite._frame.name){
          case 'lookingRightRightLegUp.png':
            ZG.currentPlayer.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            ZG.currentPlayer.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            ZG.currentPlayer.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            ZG.currentPlayer.body.velocity.y -= 50
        }

      }
      if (ZG.game.cursors.up.isDown) {
        ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
        ZG.currentPlayer.animations.play('up');
      }
      if (ZG.game.cursors.down.isDown) {
        ZG.currentPlayer.body.velocity.y = ZG.RUNNING_SPEED;
        ZG.currentPlayer.animations.play('down');
      }
      if (ZG.currentPlayer.body.velocity.x === 0 && ZG.currentPlayer.body.velocity.y === 0) {
        ZG.currentPlayer.animations.stop();
        ZG.currentPlayer.frame = 18;
      }
    }
  }

}





