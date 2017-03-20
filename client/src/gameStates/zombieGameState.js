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
    // window.socket.on('serverUpdate', this.updateClients);
    //cursor keys
    //Control Mechanics
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // this.sendToServer = throttle(this.sendPlayerToServer, 32);
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
      console.log('Local state right before load level: ', )
      this.loadLevel();
      //set interval to emit currentPlayer to server
      //if we have a current player
      if (this.currentPlayerSprite){
        const emitInterval = emitCurrentState(socket);
      }
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB

      //get state from store
      //   //update each player
      // console.log('phaser update func');
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
    // ZG.gameBackground = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'snowLandscape');
    // ZG.gameBackground.scale.setTo(0.9, 0.9);
    // ZG.gameBackground.anchor.setTo(0.5);

    //resize the world to fit the layer
    this.world.resize(500, 500);

    //for each player in lobby, create a player sprite
    // console.log('creating this amount of players: ', this.game.players.length);
    //decide player sprite
    // let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';

    let state = store.getState();
    console.log('load level begin with this state', state);

    //create a current player
    console.log('what is state.players.playerStates on loadLevel', state.players.playerStates);
    let currentPlayer;

    if (state.lobby.currentLobbyer.name){
      store.dispatch(updateCurrentPlayer(state.lobby.currentLobbyer));
      state = store.getState();
      console.log('state after adding current player from currentLobbyer', state);
      currentPlayer = state.players.currentPlayer;

      //initiate player sprite
      //TODO: make server assign sprite keys
      let currentPlayerSprite = this.add.sprite(currentPlayer.x, currentPlayer.y, 'blueGunGuy');

      //add physics to current player
      currentPlayerSprite.anchor.set(0.5);
      this.physics.arcade.enable(currentPlayerSprite);
      currentPlayerSprite.collideWorldBounds = true;

      //store on game Object
      this.currentPlayerSprite = currentPlayerSprite;
      console.log('created current Player: ', this.currentPlayerSprite);

      //create currentPlayer
      let currPlayerState =  {
            socketId: socket.id,
            x: currentPlayerSprite.x,
            y: currentPlayerSprite.y,
            animationDirection: 'still'
            //sprite: currentPlayerSprite
            //TODO: health, fire, guns, bullets, frame? etc
        }

      //send current Player to local store
      console.log('dispatched to local store after creating player');
      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('local store looks like: ', store.getState());
      //emit to server to create this player
      //console.log('sending currPlayerState', currPlayerState);

      //current player is assigned in the backend now
      //socket.emit('playerEnterGame', currPlayerState);
    }
    console.log('player states - we should create all besides current Player', state.players.playerStates);

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
    // console.log('Current Player Sprite: ', this.currentPlayerSprite);
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      animationDirection: this.currentPlayerSprite.animationDirection,
      socketId: socket.id
    }
    store.dispatch(updateCurrentPlayer(currentPlayer));
  }

  updateRemotePlayers() {
    this.players = store.getState().players.playerStates;
    // console.log('update players from server ', this.players)
    // console.log('remote player sprites', remotePlayerSprites);
    //take current player out
    if (this.players[socket.id]) delete this.players[socket.id];
    //then update each player from the server
    R.forEachObjIndexed(this.updateRemotePlayer, this.players);
    // R.forEachObjIndexed(this.killMissingPlayers, remotePlayerSprites);
  }

  updateRemotePlayer(playerState) {
    // console.log('update function received playerState: ', playerState);
    //get the sprite with player.socketId
    //check if remotePlayerSprites has a key for this playerState id
    // console.log('WHAT IS SELF.PLAYERS?', self.players);
    // console.log('DOES IT INCLUDE THIS PLAYER ID?', self.players[playerState.sockedId]);
    if (remotePlayerSprites[playerState.socketId]) {
      //if it does, access that sprite and update it
      // console.log('we found a sprite that looks like this: ', remotePlayerSprites[playerState.socketid])
      remotePlayerSprites[playerState.socketId].x = playerState.x;
      remotePlayerSprites[playerState.socketId].y = playerState.y;
    }
    // else {
    //   //if it doesnt, create a sprite and add it There
    //   console.log('creating new remote sprite');
    //   let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
    //   remotePlayerSprites[playerState.socketId] = remoteSprite;
    // }
    // if (remotePlayerSprites[playerState.socketId] && !self.players[playerState.socketId]) {
    //   console.log('killing off remote sprite: ', remotePlayerSprites[playerState.socketId])
    //   remotePlayerSprites[playerState.socketId].kill();
    //   delete remotePlayerSprites[playerState.socketId];
    // } else {
    //   if (remotePlayerSprites[playerState.socketId]) {
    //     //if it does, access that sprite and update it
    //     console.log('we found a sprite that looks like this: ', remotePlayerSprites[playerState.socketid])
    //     remotePlayerSprites[playerState.socketId].x = playerState.x;
    //     remotePlayerSprites[playerState.socketId].y = playerState.y;
    //   } else {
    //     //if it doesnt, create a sprite and add it There
    //     console.log('creating new remote sprite');
    //     let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
    //     remotePlayerSprites[playerState.socketId] = remoteSprite;
    //   }
    // }
  }

  destroyCurrentPlayerSprite(){
    //take him off
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
    console.log('state after', state);
    //Kill Remote Player Sprite
    console.log('RPS: ', remotePlayerSprites);
    if (remotePlayerSprites[playerSocketId]){
      console.log('we are removing his ass');
      remotePlayerSprites[playerSocketId].destroy();
      delete remotePlayerSprites[playerSocketId];
    }
    console.log('RPS AFTER: ', remotePlayerSprites);
  }

  createRemotePlayerSprite(playerState){
    if (playerState.socketId !== socket.id){
      console.log('creating player with this ID: ', playerState.socketId);
      let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
      remotePlayerSprites[playerState.socketId] = remoteSprite;
    }
  }
}
