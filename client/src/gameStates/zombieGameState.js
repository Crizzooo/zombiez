const R = require('ramda');
const throttle = require('lodash.throttle');

import store from '../store.js';
import {setCurrentPlayer, updateCurrentPlayer} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';

let remoteSprites = {};
var self;
export default class ZombieGameState extends Phaser.State {
  init () {
    //set constants for game
    this.RUNNING_SPEED = 180;
    self = this;
    // window.socket.on('serverUpdate', this.updateClients);
    //cursor keys
    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // this.sendToServer = throttle(this.sendPlayerToServer, 32);
  }


  preload () {
      //load assets that are specific for this level
  }

  create () {
      //create game set up
      this.loadLevel();
      //set interval to emit currentPlayer to server
      const emitInterval = emitCurrentState(socket);
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB

      //get state from store
      //   //update each player
      // console.log('phaser update func');
      this.updateRemotePlayers();
      this.handleInput();
      this.dispatchCurrentPlayer();
      //every 32ms send package to server with position

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
    // console.log('creating this amount of players: ', this.game.players.length);
    console.log('loading level');
    //decide player sprite
    // let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';

    //create a current player
    console.log('what is this.game.players', this.game.players);
    let currentPlayer = this.game.players.filter( (player) => {
      return player.socketId === socket.id;
    })[0];

    console.log('after filter');
    if (currentPlayer) {
      //initiate player sprite
      let currentPlayerSprite = this.add.sprite(this.world.centerX, this.world.centerY, 'blueGunGuy');

      //add physics to current player
      currentPlayerSprite.anchor.set(0.5);
      this.physics.arcade.enable(currentPlayerSprite);
      currentPlayerSprite.collideWorldBounds = true;

      //store on game Object
      this.currentPlayer = currentPlayerSprite;

      //create currentPlayer
      let currPlayerState =  {
            socketId: socket.id,
            x: currentPlayerSprite.x,
            y: currentPlayerSprite.y,
            animationDirection: 'still'
            // sprite: currentPlayerSprite
            //TODO: health, fire, guns, bullets, frame? etc
        }

      console.log('pre dispatch');
      //send current Player to local store
      store.dispatch(setCurrentPlayer(currPlayerState));
      //emit to server to create this player
      console.log('pre emit');
      console.log('sending currPlayerState', currPlayerState);
      socket.emit('playerEnterGame', currPlayerState);
      console.log('did we hit here');
    }
  }

  handleInput() {
    if (this.currentPlayer){
      if ( this.cursors.left.isDown ||
          this.cursors.right.isDown ||
             this.cursors.up.isDown ||
          this.cursors.down.isDown
        ) {
            if (this.cursors.left.isDown){
              this.currentPlayer.body.velocity.x = -this.RUNNING_SPEED;
              this.currentPlayer.animationDirection = 'left';
            }
            if (this.cursors.right.isDown){
              this.currentPlayer.body.velocity.x =  this.RUNNING_SPEED;
              this.currentPlayer.animationDirection = 'right';
            }
            if (this.cursors.up.isDown){
              this.currentPlayer.body.velocity.y = -this.RUNNING_SPEED;
              this.currentPlayer.animationDirection = 'up';
            }
            if (this.cursors.down.isDown){
              this.currentPlayer.body.velocity.y =  this.RUNNING_SPEED;
              this.currentPlayer.animationDirection = 'down';
            }
        } else {
          //no cursors down
          this.currentPlayer.body.velocity.x = 0;
          this.currentPlayer.body.velocity.y = 0;
          this.currentPlayer.animationDirection = 'still';
        }
    }
  }

  dispatchCurrentPlayer() {
    console.log('Current Player Sprite: ', this.currentPlayer);
    let currentPlayer = {
      x: this.currentPlayer.x,
      y: this.currentPlayer.y,
      animationDirection: this.currentPlayer.animationDirection,
      socketId: socket.id
    }
    store.dispatch(updateCurrentPlayer(currentPlayer));
  }

  updateRemotePlayers() {
    console.log('update remote players');
    console.log('state: ', store.getState());
    let players = store.getState().players.allPlayers.playerStates;
    console.log('players from server', players);
    delete players[socket.id];
    R.forEachObjIndexed(this.updateRemotePlayer, players);
  }

  updateRemotePlayer(playerState) {
    console.log('update function received playerState: ', playerState);
    //get the sprite with player.socketId
    //check if remoteSprites has a key for this playerState id
    if (remoteSprites[playerState.socketId]) {
      //if it does, access that sprite and update it
      console.log('we found a sprite that looks lioke this: ', remoteSprites[playerState.socketid])
      remoteSprites[playerState.socketId].x = playerState.x;
      remoteSprites[playerState.socketId].y = playerState.y;

    } else {
      //if it doesnt, create a sprite and add it There
      let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
      remoteSprites[playerState.socketId] = remoteSprite;
    }
  }


}
