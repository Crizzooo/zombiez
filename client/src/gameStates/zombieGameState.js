const R = require('ramda');
const throttle = require('lodash.throttle');

import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';

let remotePlayerSprites = {};
var self;
export default class ZombieGameState extends Phaser.State {
  init () {
    //set constants for game
    this.RUNNING_SPEED = 180;
    self = this;

    //cursor keys
    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    // this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Attach and bind functions
    this.destroyCurrentPlayerSprite = this.destroyCurrentPlayerSprite.bind(this);
    this.handleRemotePlayerLeave = this.handleRemotePlayerLeave.bind(this);
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);
  }


  preload () {
      //load assets that are specific for this level
  }

  create () {
      //create game set up
      console.log('Local state right before load level: ', store.getState() )
      this.loadLevel();
      //set interval to emit currentPlayer to server
      //if we have a current player
      if (this.currentPlayerSprite){
        const emitInterval = emitCurrentState(socket);
      }
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB

      this.updateRemotePlayers();
      if (this.currentPlayerSprite) {
        this.handleInput();
        this.dispatchCurrentPlayer();
      }
      //every 32ms send package to server with position

  }

    //////////////////////////
   /// Non Phaser Methods ///
  //////////////////////////

  loadLevel () {
    // this.gameBackground = this.add.sprite(this.world.centerX, this.world.centerY, 'snowLandscape');
    // this.gameBackground.scale.setTo(0.9, 0.9);
    // this.gameBackground.anchor.setTo(0.5);

    //resize the world to fit the layer
    this.world.resize(500, 500);

    let state = store.getState();
    console.log('load level begin with this state', state);

    //create a current player
    console.log('what is state.players.playerStates on loadLevel', state.players.playerStates);

    let currentPlayer;
    if (state.players.currentPlayer.socketId){
      currentPlayer = state.players.currentPlayer;

      //TODO: make server assign sprite keys
      this.currentPlayerSprite = this.add.sprite(currentPlayer.x, currentPlayer.y, 'blueGunGuy');

      //add physics to current player
      this.currentPlayerSprite.anchor.set(0.5);
      this.physics.arcade.enable(this.currentPlayerSprite);
      this.currentPlayerSprite.collideWorldBounds = true;

      //store on game Object
      console.log('created current Player: ', this.currentPlayerSprite);

      //create currentPlayer
      let currPlayerState =  {
            socketId: socket.id,
            x: this.currentPlayerSprite.x,
            y: this.currentPlayerSprite.y,
            animationDirection: 'still'
            //TODO: health, fire, guns, bullets, frame? etc
        }

      console.log('Where is  current player on game start?', currPlayerState);

      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);
  }

  handleInput() {
    if (this.currentPlayerSprite){
      if ( this.cursors.left.isDown ||
          this.cursors.right.isDown ||
             this.cursors.up.isDown ||
          this.cursors.down.isDown
        ) {
            if (this.cursors.left.isDown){
              this.currentPlayerSprite.body.velocity.x = -this.RUNNING_SPEED;
              this.currentPlayerSprite.animationDirection = 'left';
            }
            if (this.cursors.right.isDown){
              this.currentPlayerSprite.body.velocity.x =  this.RUNNING_SPEED;
              this.currentPlayerSprite.animationDirection = 'right';
            }
            if (this.cursors.up.isDown){
              this.currentPlayerSprite.body.velocity.y = -this.RUNNING_SPEED;
              this.currentPlayerSprite.animationDirection = 'up';
            }
            if (this.cursors.down.isDown){
              this.currentPlayerSprite.body.velocity.y =  this.RUNNING_SPEED;
              this.currentPlayerSprite.animationDirection = 'down';
            }
        } else {
          //no cursors down
          this.currentPlayerSprite.body.velocity.x = 0;
          this.currentPlayerSprite.body.velocity.y = 0;
          this.currentPlayerSprite.animationDirection = 'still';
        }
    }
  }

  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      animationDirection: this.currentPlayerSprite.animationDirection,
      socketId: socket.id
    }
    store.dispatch(updateCurrentPlayer(currentPlayer));
  }

  //TODO: move remote player updates to other file
  updateRemotePlayers() {
    this.players = store.getState().players.playerStates;
    if (this.players[socket.id]) delete this.players[socket.id];
    //then update each player from the server
    R.forEachObjIndexed(this.updateRemotePlayer, this.players);
  }

  updateRemotePlayer(playerState) {
    if (remotePlayerSprites[playerState.socketId]) {
      remotePlayerSprites[playerState.socketId].x = playerState.x;
      remotePlayerSprites[playerState.socketId].y = playerState.y;
      //TODO: Implement other properties
    }
  }

  destroyCurrentPlayerSprite(){
    if (this.currentPlayerSprite){
      this.currentPlayerSprite.destroy();
      delete this.currentPlayerSprite;
      console.log('deleted and destroyed this.currentPlayerSprite');
      let state = store.getState();
      console.log('state after destroy current player');
      console.dir(state, { depth: 3 });
    }
  }

  handleRemotePlayerLeave(playerSocketId){
    store.dispatch(playerLeaveGame(playerSocketId));
    let state = store.getState();
    //Kill Remote Player Sprite
    if (remotePlayerSprites[playerSocketId]){
      console.log('we are removing remote player sprite');
      remotePlayerSprites[playerSocketId].destroy();
      delete remotePlayerSprites[playerSocketId];
    }
  }

  createRemotePlayerSprite(playerState){
    if (playerState.socketId !== socket.id){
      console.log('creating remote player with this playerState: ', playerState);
      let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
      remotePlayerSprites[playerState.socketId] = remoteSprite;
    }
  }
}
