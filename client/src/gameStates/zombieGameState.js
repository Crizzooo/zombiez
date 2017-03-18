const R = require('ramda');
const throttle = require('lodash.throttle');


ZG.playerSprites = [];

export default class ZombieGameState extends Phaser.State {
  init () {
    //set constants for game
    this.RUNNING_SPEED = 180;

    window.socket.on('serverUpdate', this.updateClients);
    //cursor keys
    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.sendToServer = throttle(this.sendPlayerToServer, 32);
  }


  preload () {
      //load assets that are specific for this level
  }

  create () {
      //create game set up
      this.loadLevel();
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB
      this.handleInput();
      //every 32ms send package to server with position
      this.sendToServer();

  }

    //////////////////////////
   /// Non Phaser Methods ///
  //////////////////////////

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
      playerSprite.anchor.set(0.5);
      this.physics.arcade.enable(playerSprite);
      playerSprite.collideWorldBounds = true;
      let interpolate = this.add.tween(playerSprite);
      console.log('created sprite: ', playerSprite);
      //determine if client is currently a player, and assign his sprite to currentPlayer object
      if (socket.id === playerObj.socketId) {
        ZG.currentPlayer = playerSprite;
        console.log('current player assigned:', playerSprite);
      }
      ZG.playerSprites.push({socketId: playerObj.socketId, sprite: playerSprite, interpolate});
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
          ZG.currentPlayer.body.velocity.x =  ZG.RUNNING_SPEED;
      }
      if (this.cursors.up.isDown){
          ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
      }
      if (this.cursors.down.isDown){
          ZG.currentPlayer.body.velocity.y =  ZG.RUNNING_SPEED;
      }
    }
  }

  sendPlayerToServer(){
    let x = ZG.currentPlayer.body.x;
    let y = ZG.currentPlayer.body.y;
    let gameTime = new Date() - ZG.startDate;
    let playerId = socket.id;
    console.log('NEW DATE: ', new Date());
    console.log('START DATE: ', ZG.startDate);
    console.log(typeof ZG.startDate);
    console.log('GAMETIME TO STRING ', gameTime.toString());
    console.log('GAMETIME FOR PLAYER: ', parseInt(gameTime, 10));

    let clientState = {
      x,
      y,
      gameTime,
      playerId
    }

    socket.emit('clientUpdate', clientState);
  }

  updateClients(serverState) {
    // console.log('this:', this); //THIS IS A SOCKET
    console.log('this.updatePlayer', this.updatePlayer);
    console.log('updatePlayer', updatePlayer);
    R.forEachObjIndexed(this.updatePlayer, serverState);
  }

  updatePlayer(playerState) {

    let playerToMove = ZG.playerSprites.filter((playerSprite) => {
      return playerSprite.socketId == playerState.id;
    })[0];

    console.log('Player To Move: ', playerToMove);

    if (!playerToMove.lastUpdate){
      playerToMove.lastUpdate  = 0;
    }

    if (playerToMove && playerToMove.socketId != window.socket.id){
      playerToMove.sprite.x = playerState.x;
      playerToMove.sprite.y = playerState.y;

      //Tween Interpolation
      // console.log(' gameTime:', playerState.gameTime)
      // console.log(' last Update:', playerToMove.lastUpdate)
      // var timeToTween = (playerState.gameTime - playerToMove.lastUpdate) / 5;
      // console.log(' timeToTween:', timeToTween);
      // let interTween = self.add.tween(playerToMove.sprite);
      // interTween.to({ x: playerState.x, y: playerState.y }, timeToTween, Phaser.Easing.Linear.None, true);
      // console.log('TWEEN?', interTween);
      // interTween.onComplete.addOnce( ()=> console.log('TWEEN HAS COMPLETED... YOU HEAR?'));
      // playerToMove.lastUpdate = new Date() - ZG.startDate;
    }
  }

}
