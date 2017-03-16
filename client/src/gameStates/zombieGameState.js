const R = require('ramda');
const throttle = require('lodash.throttle');

export default class ZombieGameState extends Phaser.State {
  init () {
    //set constants for game
    ZG.RUNNING_SPEED = 180;

    //cursor keys
    //this.cursors created in boot state file
  }

  preload () {
      //load assets that are specific for this mini game
  }

  create () {
      //create game set up
      this.loadLevel();
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB
      this.handleInput();
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
    ZG.playerSprites = ZG.players.map( (playerObj, index) => {
      console.log('player created for: ', playerObj);
      let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';
      let playerSprite = this.add.sprite(this.world.centerX + 15*index, this.world.centerY + 15*index, spriteKey);
      this.physics.arcade.enable(playerSprite);
      //determine if client is currently a player, and assign his sprite to currentPlayer object
      if (socket.id === playerObj.socketId) {
          ZG.currentPlayer = playerSprite;
      }
    });
  };

  handleInput() {
    if (ZG.currentPlayer){
      ZG.currentPlayer.body.velocity.x = 0;
      ZG.currentPlayer.body.velocity.y = 0;
      if (this.cursors.left.isDown){
          ZG.currentPlayer.body.velocity.x = -ZG.RUNNING_SPEED;
      }
      if (this.cursors.right.isDown){
          ZG.currentPlayer.body.velocity.x = ZG.RUNNING_SPEED;
      }
      if (this.cursors.up.isDown){
          ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
      }
      if (this.cursors.down.isDown){
          ZG.currentPlayer.body.velocity.y = ZG.RUNNING_SPEED;
      }
    }
  }

}












