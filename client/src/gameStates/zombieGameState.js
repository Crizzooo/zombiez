const R = require('ramda');
import _ from 'lodash';
const throttle = require('lodash.throttle');

import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';

//Import game plugins and tiledstate
import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding';
import Lighting from '../plugins/Lighting';

//Import Helpers
import { handleInput, tweenCurrentPlayerAssets } from './zgsHelpers/handlePlayerInput';
import handleRemoteAnimation, { tweenRemoteAssets } from './zgsHelpers/handleRemoteAnimation'

//TODO: do we need this?
let remotePlayerSprites = {};
var self;

export default class ZombieGameState extends TiledState {
  constructor(game) {
    super(game);

    //set constants for game
    self = this;
  }

  init(levelData) {
    //Call super init to load in data;
    super.init.call(this, levelData);

    //Attach and bind functions
    this.destroyCurrentPlayerSprite = this.destroyCurrentPlayerSprite.bind(this);
    this.handleRemotePlayerLeave = this.handleRemotePlayerLeave.bind(this);

    //Throttled Console logs
	  this.toggledRPS = throttle(this.logRemotePlayers, 20000);

    //Sockets
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);
    socket.on('remoteFire', this.handleRemotePlayerFire);
    socket.on('remoteReceiveDamage', this.handleRemotePlayerReceiveDamage)
  }

  preload() {
    //load assets that are specific for this level
  }

  create() {
    //Create game set up through tiled state by calling super
    //Loads level tilemap
    super.create.call(this);

    //Create worldGrid and tile dimensions for pathfinding
    //Load light plugin
    let worldGrid = this.createWorldGrid();
    this.tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, worldGrid, [-1], this.tileDimensions);
    this.lightingPlugin = new Lighting(this);

    //Create Players and Temp Objects
    let crosshair = new Phaser.Sprite(this.game, 0, 0, 'crosshairSpriteSheet');

	  //create game set up
	  //This creates player prefab
	  this.loadLevel();

	  ///////////TODO: WIP
    let enemyPrefab = this.createPrefab('zombie',
      {
        type: 'enemies',
        properties: {
	        group: 'enemies',
	        initial: 9,
	        texture: 'zombieSpriteSheet'
        }
      }, {x: 200, y: 200});

    this.currentEnemy = enemyPrefab;
    this.currentEnemy.moveTo = throttle(this.currentEnemy.moveTo, 1000);
    this.currentEnemy.animations.play('left');

    //Remote Player Movement
    //This gets us the first player from the remote players
    console.log('this is remote player sprites', remotePlayerSprites);

    //set interval to emit currentPlayer to server
    //if we have a current player
    if (this.currentPlayerSprite) {
      this.currentPlayerSprite.gun.initializeWeapon(this);
      this.pointer = crosshair;

      //add to world
      this.game.add.existing(this.pointer);

      const emitInterval = emitCurrentState(socket);

      //on click lock the users mouse for input
      this.game.input.onDown.add(this.lockPointer, this);

      //Only follow current player if we have a current player
      this.camera.follow(this.currentPlayerSprite);
    } else {
      //follow the first remote player
      let remotePlayerOneId = Object.keys(remotePlayerSprites)[0];
      this.camera.follow(remotePlayerSprites[remotePlayerOneId]);
    }

    //Push all sprites in the world onto the child of the mapSpriteOverlay
    //All prefabs created with a pushToOverlay = true
    this.game.world.children.forEach((layer) => {
      if (layer.pushToOverlay) {
	      this.lighting.mapSprite.addChild(layer)
      }
    });
    //Also push all remote players and their assets onto the lighting layer
	  for (let key in remotePlayerSprites) {
	    if (remotePlayerSprites.hasOwnProperty(key)) {
	      this.lighting.mapSprite.addChild(remotePlayerSprites[key])
		    this.lighting.mapSprite.addChild(remotePlayerSprites[key].healthbar)
      }
    }

	  console.log('THIS IS WORLD', this.game.world.children)
	  console.log('this is groups', this.groups)
  }

  update() {
    //Check collisions
    //NOTE: only check CPS collissions if we do have a CPS
    if (this.currentPlayerSprite){
      this.updateCollisions();
      //TODO: check if remote players hit any zombies - kill bullet, emit zombieHit

      //Set up local client lighting
      this.lightingPlugin.update();

      //Server & Input
      //every 32ms send package to server with position
      handleInput(this.currentPlayerSprite);
      this.dispatchCurrentPlayer();

      //Tween all player assets
      //Remote and current
      tweenCurrentPlayerAssets(this.currentPlayerSprite, this);
    }

    //collisions for remoteBulletGroups
    this.game.physics.arcade.collide(this.remoteBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this)
	  this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);
	  this.game.physics.arcade.collide(this.currentEnemy, this.currentPlayerSprite.gun.gunBullets, this.bulletHitZombie, null, this);

    //Pathfinding
	  this.groups.enemies.forEachAlive((enemy) => {
	  	enemy.moveTo(enemy.acquireTarget(this.groups.player));
	  });

    //Server & Input
    //every 32ms send package to server with position
	  //If there are remote clients, update their stuff
    if (!_.isEmpty(remotePlayerSprites)) {
	    this.updateRemotePlayers();

	    for (let key in remotePlayerSprites) {
		    // console.log('all remote socket keys', key);
		    // console.log('all remote socket keys 2', socket.id);
          if (key !== socket.id) {
            //Handle Animations clientside for remote players
            handleRemoteAnimation(remotePlayerSprites[key]);
            tweenRemoteAssets(remotePlayerSprites[key], this);
	          this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);
          }
		    }
	    }

    this.toggledRPS();
  }

  // render() {
  //   this.game.debug.spriteInfo(this.gun, 32, 32);
  // }

  //////////////////////////
  /// Non Phaser Methods ///
  //////////////////////////

  loadLevel() {
    let state = store.getState();

    console.log('load level begin with this state', state);
    console.log('what is state.players.playerStates on loadLevel', state.players.playerStates);

    //create a current player
    let currentPlayer;

    if (state.players.currentPlayer.name) {
      console.log('we have a current player so we shall call him: ', state.players.currentPlayer.name);
      currentPlayer = state.players.currentPlayer;

      //TODO: make server assign sprite keys
      let playerPrefab = this.createPrefab(currentPlayer.name,
        {
          type: 'player',
          properties: {
            group: 'player',
            initial: 18,
            texture: 'playerSpriteSheet',
            socketId: socket.id
          },
        }, {x: 225, y: 225}); //change to new location from server

      this.currentPlayerSprite = playerPrefab;

      //store on game Object
      console.log('created current Player: ', this.currentPlayerSprite);

      //create currentPlayer
      let currPlayerState = {
        socketId: socket.id,
        x: this.currentPlayerSprite.x,
        y: this.currentPlayerSprite.y,
        animationDirection: this.currentPlayerSprite.direction,
        name: currentPlayer.name,
        health: this.currentPlayerSprite.stats.health,
        gunRotation: this.currentPlayerSprite.gun.rotation
        //TODO: health, fire, guns, bullets, frame? etc
      }

      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }

    console.log('Creating Sprites for each player in this: ', state.players.playerStates);
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);

    //TODO - create player sprite group using all in RPS, and CP sprite
    this.playerSpriteGroup = this.game.add.group();

    //if current player, add to group
    if (this.currentPlayerSprite) {
      this.playerSpriteGroup.add(this.currentPlayerSprite);
    }

    R.forEachObjIndexed(this.addRemotePlayerToGroup, remotePlayerSprites);

    console.log('our player sprite group length: ', this.playerSpriteGroup.length);

    //TODO initialize game.remoteBulletGroup
    //TODO: call gun.shoot with this bulletGroup when a remote player is firing
    this.remoteBulletGroup = this.game.add.group();
    this.remoteBulletGroup.name = 'remoteBulletGroup';
  }

  updateCollisions () {
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);

	  //NOTE: check if remote bullets hit wallCollision - kill bullet
	  this.game.physics.arcade.collide(this.currentPlayerSprite.gun.gunBullets, this.layers.wallCollision, this.bulletHitWall, null, this);

	  //NOTE: check if own bullets hit playerSprites - emit a hit
	  this.game.physics.arcade.collide(this.currentPlayerSprite.gun.gunBullets, this.playerSpriteGroup, this.bulletHitPlayer, null, this);
  }

  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      name: this.currentPlayerSprite.name,
      animationDirection: this.currentPlayerSprite.direction,
	    gunRotation: this.currentPlayerSprite.gun.rotation,
      socketId: socket.id,
      pointerX: this.currentPlayerSprite.pointerX,
      pointerY: this.currentPlayerSprite.pointerY,
      health: this.currentPlayerSprite.stats.health
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
      remotePlayerSprites[playerState.socketId].direction = playerState.animationDirection;
	    //remotePlayerSprites[playerState.socketId].gun.rotation = playerState.gunRotation;
      //TODO: Implement other properties
    }
  }

  destroyCurrentPlayerSprite() {
    if (this.currentPlayerSprite) {
      this.currentPlayerSprite.destroy();
      delete this.currentPlayerSprite;
      console.log('deleted and destroyed this.currentPlayerSprite');
      let state = store.getState();
      console.log('state after destroy current player');
      console.dir(state, {depth: 3});
    }
  }

  handleRemotePlayerLeave(playerSocketId) {
    store.dispatch(playerLeaveGame(playerSocketId));
    //let state = store.getState();

    //Kill Remote Player Sprite
    if (remotePlayerSprites[playerSocketId]) {
      console.log('we are removing remote player sprite');
      remotePlayerSprites[playerSocketId].destroy();
      delete remotePlayerSprites[playerSocketId];
    }
  }

  lockPointer() {
    document.body.style.cursor = 'none';
    this.game.canvas.addEventListener('mousemove', () => {
      this.pointer.x = this.game.input.activePointer.worldX;
      this.pointer.y = this.game.input.activePointer.worldY;
    });
  }

  createRemotePlayerSprite(playerState) {
    //TODO: name needs to be unique for each remote player
    //TODO: take name from server
    if (playerState.socketId !== socket.id) {
      console.log('creating prefab for player', playerState)
      let playerPrefab = self.createPrefab(playerState.name,
        {
          type: 'player',
          properties: {
            group: 'player',
            initial: 18,
            texture: 'playerSpriteSheet'
          },
        }, {x: playerState.x, y: playerState.y});
      self.game.add.existing(playerPrefab);
      remotePlayerSprites[playerState.socketId] = playerPrefab;
      remotePlayerSprites[playerState.socketId].gun.initializeWeapon(self);
      console.log('the created player sprite: ', playerPrefab);
      console.log('updated RPS after add: ', remotePlayerSprites);
    }
  }

  handleRemotePlayerFire(fireObj) {
    let playerWhoFired = remotePlayerSprites[fireObj.socketId];
    remotePlayerSprites[fireObj.socketId].pointerX = fireObj.pointerX;
    remotePlayerSprites[fireObj.socketId].pointerY = fireObj.pointerY;
    console.log('this motherfucker just fired: ', playerWhoFired);
    remotePlayerSprites[fireObj.socketId].gun.shoot(remotePlayerSprites[fireObj.socketId], self.remoteBulletGroup);
  }

  handleRemotePlayerReceiveDamage(damageObj){
    console.log("DAMAGE OBJ", damageObj);
    let playerWhoReceivedDamage = remotePlayerSprites[damageObj.socketId];
    remotePlayerSprites[damageObj.socketId].receiveDamage(damageObj.newDamage);
  }

  logRemotePlayers(){
    console.log('RPS: ', remotePlayerSprites);
    console.log('Local State: ', store.getState());
    console.log('CPS: ', this.currentPlayerSprite);
  }

  addRemotePlayerToGroup(remotePlayerSprite){
    console.log('adding this RP to group: ', remotePlayerSprite);
    self.playerSpriteGroup.add(remotePlayerSprite);
  }

  bulletHitWall(bullet, layer){
    console.log('this bullet has hit a wall: ', bullet);
    if (bullet.parent.name === 'currentPlayerBulletGroup'){
      console.log('i just hit a fucking wall, I suck');
    } else if (bullet.parent.name === 'remoteBulletGroup') {
      console.log('remote player bullet just hit a fucking wall, ok??');
    }
    bullet.kill();
  }

  bulletHitZombie(zombie, bullet){
    console.log("ZOMBZ", zombie);
    zombie.hit = true;
    zombie.animations.stop();
    zombie.animations.play('dead')
    //let animationRef = zombie.animations.play('dead').animationReference.isPlaying;

    zombie.animations.currentAnim.onComplete.add( () => {
      zombie.kill();
    })
    bullet.kill();
  }

  bulletHitPlayer(bullet, player){
      bullet.kill();
    // socket.emit('playerReceiveDamage', {
    //   socketId: socket.id,
    //   newDamage: player.gun.damage
    // });
      if (bullet.parent.name === 'currentPlayerBulletGroup'){
        //TODO: emit to server
        console.log('I HIT A MOTHERFUCKER');
      } else if (bullet.parent.name === 'remoteBulletGroup') {
        console.log('eh someone else hit someone');
      }
  }
}
