const R = require('ramda');
const throttle = require('lodash.throttle');

//import Player from '../prefabs/player'

import TiledState from './tiledState';

export default class ZombieGameState extends TiledState {
  constructor (game) {
    super(game);
  }

  init (levelData) {
    //set constants for game
    this.RUNNING_SPEED = 80;

    //Call super init to load in data;
    super.init.call(this, levelData)

    //Make pixels crisp
    //this.stage.smoothed = false;

  }

  preload () {




    //TODO: fix spegetti
    //let playerSprite = ZG.game.add.sprite(this.game, ZG.game.world.centerX + 15 * index, ZG.game.world.centerY + 15 * index, spriteKey, 18);

    // //for each player in lobby, create a player sprite
    // ZG.playerSprites = ZG.players.map((playerObj, index) => {
    //   //determine if client is currently a player, and assign his sprite to currentPlayer object
    //   if (socket.id === playerObj.socketId) {
    //     this.currentPlayer = playerPrefab;
    //   }
    // });


  }

  create () {
    //Create game set up through tiled state by calling super
    super.create.call(this);



    let playerPrefab = this.createPrefab('player',
      { type: 'player',
        properties: {
          group: 'player',
          initial: 18,
          texture: 'playerSpriteSheet'
        },
      }, {x: 225, y: 225});


    console.log("this is player prefab", playerPrefab);
    this.currentPlayer = playerPrefab;
  }

  update () {
    this.handleInput();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Non Phaser Methods

  handleInput () {

    //this.cursors = this.input.keyboard.createCursorKeys();
    //console.log('this is cursors', this);

    if (this.currentPlayer) {
      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;
      // console.log("VELOCITY", this.currentPlayer.body.velocity.x, this.currentPlayer.body.velocity.y);
      if (this.game.cursors.left.isDown) {
        // if(playerStatus === '')
        this.currentPlayer.animations.play('right');
        this.currentPlayer.scale.setTo(-1, 1);
        this.currentPlayer.body.velocity.x = -this.RUNNING_SPEED;

        switch(this.currentPlayer.body.sprite._frame.name){
          case 'lookingRightRightLegUp.png':
            this.currentPlayer.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            this.currentPlayer.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            this.currentPlayer.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            this.currentPlayer.body.velocity.y -= 50
        }

      }
      if (this.game.cursors.right.isDown) {
        this.currentPlayer.scale.setTo(1, 1);
        this.currentPlayer.animations.play('right');
        this.currentPlayer.body.velocity.x = this.RUNNING_SPEED;
        switch(this.currentPlayer.body.sprite._frame.name){
          case 'lookingRightRightLegUp.png':
            this.currentPlayer.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            this.currentPlayer.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            this.currentPlayer.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            this.currentPlayer.body.velocity.y -= 50
        }

      }
      if (this.game.cursors.up.isDown) {
        this.currentPlayer.body.velocity.y = -this.RUNNING_SPEED;
        this.currentPlayer.animations.play('up');
      }
      if (this.game.cursors.down.isDown) {
        this.currentPlayer.body.velocity.y = this.RUNNING_SPEED;
        this.currentPlayer.animations.play('down');
      }
      if (this.currentPlayer.body.velocity.x === 0 && this.currentPlayer.body.velocity.y === 0) {
        this.currentPlayer.animations.stop();
        this.currentPlayer.frame = 18;
      }
    }
  }
}





