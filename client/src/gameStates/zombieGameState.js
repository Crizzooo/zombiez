const R = require('ramda');
const throttle = require('lodash.throttle');


var self;
ZG.playerSprites = [];

export default class ZombieGameState extends Phaser.State {
  init () {
    //set constants for game
    self = this;
    ZG.RUNNING_SPEED = 180;

    window.socket.on('serverUpdate', this.updateClients);
    //cursor keys
    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.sendToServer = throttle(this.sendPlayerToServer, 16);
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
      //every 16ms send package to server with position
      this.sendToServer();

  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Non Phaser Methods

  loadLevel () {
    // ZG.gameBackground = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'snowLandscape');
    // ZG.gameBackground.scale.setTo(0.9, 0.9);
    // ZG.gameBackground.anchor.setTo(0.5);

    //resize the world to fit the layer
    this.world.resize(500, 500);

    //for each player in lobby, create a player sprite
    console.log('creating this amount of players: ', this.game.players.length);
    this.game.players.map( (playerObj, index) => {
      let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';
      let playerSprite = this.add.sprite(this.world.centerX + 15*index, this.world.centerY + 15*index, spriteKey);
      console.log('created player at ', this.world.centerX + 15*index);
      console.log('created player at ', this.world.centerY + 15*index);

      this.physics.arcade.enable(playerSprite);
      playerSprite.collideWorldBounds = true;
      console.log('created sprite: ', playerSprite);
      //determine if client is currently a player, and assign his sprite to currentPlayer object
      if (socket.id === playerObj.socketId) {
        ZG.currentPlayer = playerSprite;
        console.log('current player assigned:', playerSprite);
      }
      ZG.playerSprites.push({socketId: playerObj.socketId, sprite: playerSprite});
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

  // throttledServerUpdate() {
  //   console.log('sending to server');
  //   return throttle(this.sendPlayerToServer, 16);
  // }

  sendPlayerToServer(){
    let x = ZG.currentPlayer.body.x;
    let y = ZG.currentPlayer.body.y;
    let gameTime = new Date() - ZG.startDate;
    let playerId = socket.id;
    console.log('Are we sending a socket:', socket);

    let clientState = {
      x,
      y,
      gameTime,
      playerId
    }

    socket.emit('clientUpdate', clientState);
  }

  updateClients(serverState) {
    R.forEachObjIndexed(self.updatePlayer, serverState);
    // console.log('state from server:', serverState);
  }

  updatePlayer(playerState) {

    // console.log('should be id', playerState)

    // console.log('filtering: ', ZG.playerSprites);
    // console.log('looking for id:', playerState.id);
    let playerToMove = ZG.playerSprites.filter((playerSprite) => {
      // console.log('examining sprite: ', playerSprite)
      // console.log('returning: ', playerSprite.socketId == playerState.id);
      return playerSprite.socketId == playerState.id;
    })[0];

    // console.log('Player To Move: ', playerToMove);

    // let playerToMove = R.find(R.propEq('id', playerState.id))(ZG.playerSprites);

    if (playerToMove && playerToMove.socketId != window.socket.id){
      playerToMove.sprite.x = playerState.x;
      playerToMove.sprite.y = playerState.y;
    }
  }

}
