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

 const PLAYER_HEALTH = require('../engine/gameConstants.js').PLAYER_HEALTH;

//TODO: do we need this?
// currentPlayerSprite and remotePlayerSprites are on global window
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
    this.throttledUpdateRemotePlayers = throttle(this.updateRemotePlayers.bind(this), 32);


    //Throttled Console logs
	  this.throttledRPS = throttle(this.logRemotePlayers, 20000);

    //Sockets
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);
    socket.on('remoteFire', this.handleRemotePlayerFire);
    socket.on('damagePlayer', this.handlePlayerDamage);
    // socket.on('remoteReceiveDamage', this.handleRemotePlayerReceiveDamage)
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

    //Set camera to follow, then make world big to allow camera to pan off
    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
    this.game.world.setBounds(-250, -250, 3200 + 250, 3200 + 250);


    //set interval to emit currentPlayer to server
    //if we have a current player
    if (currentPlayerSprite) {
      currentPlayerSprite.gun.initializeWeapon(this);
      this.pointer = crosshair;

      //add to world
      this.game.add.existing(this.pointer);

      const emitInterval = emitCurrentState(socket);

      //on click lock the users mouse for input
      this.game.input.onDown.add(this.lockPointer, this);

      //Only follow current player if we have a current player
      this.camera.follow(currentPlayerSprite);
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
    console.log('THIS IS ', this)
  }

  update() {
    //Check collisions
    //NOTE: only check CPS collissions if we do have a CPS
    if (currentPlayerSprite){
      this.game.physics.arcade.collide(currentPlayerSprite, this.layers.backgroundDecCollision);
      this.game.physics.arcade.collide(currentPlayerSprite, this.layers.backgroundDecCollision2);
      this.game.physics.arcade.collide(currentPlayerSprite, this.layers.waterCollision);
      this.game.physics.arcade.collide(currentPlayerSprite, this.layers.wallCollision);

      //NOTE: check if remote bullets hit wallCollision - kill bullet
      // this.game.physics.arcade.collide(currentPlayerSprite.gun.gunBullets, this.layers.wallCollision, this.bulletHitWall, null, this);


      //NOTE: check if own bullets hit playerSprites - emit a hit
      // this.game.physics.arcade.collide(currentPlayerSprite.gun.gunBullets, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

      this.updateCollisions();

      //Set up local client lighting
      this.lightingPlugin.update();

      //Server & Input
      //every 32ms send package to server with position
      handleInput(currentPlayerSprite);
      this.dispatchCurrentPlayer();

      //Tween all player assets
      //Remote and current
      tweenCurrentPlayerAssets(currentPlayerSprite, this);


      //collisions for remoteBulletGroups
      // this.game.physics.arcade.collide(this.remoteBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this)
  	  // this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

    }


    //Server & Input
    //every 32ms send package to server with position
	  //If there are remote clients, update their stuff
    if (!_.isEmpty(remotePlayerSprites)) {
	    this.throttledUpdateRemotePlayers();
    }

    this.throttledRPS();
  }

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

      currentPlayerSprite = playerPrefab;
      this.currentPlayerSprite = currentPlayerSprite;

      //store on game Object
      console.log('created current Player: ', currentPlayerSprite);

      //create currentPlayer
      let currPlayerState = {
        socketId: socket.id,
        x: currentPlayerSprite.x,
        y: currentPlayerSprite.y,
        animationDirection: currentPlayerSprite.direction,
        name: currentPlayer.name,
        health: PLAYER_HEALTH,
        gunRotation: currentPlayerSprite.gun.rotation,
        socketId: currentPlayerSprite.socketId
        //TODO: health, fire, guns, bullets, frame? etc
      }

      //add it to the world
      this.game.add.existing(currentPlayerSprite);
      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }

    console.log('Creating Sprites for each player in this: ', state.players.playerStates);
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);

    //TODO - create player sprite group using all in RPS, and CP sprite
    this.playerSpriteGroup = this.game.add.group();

    //if current player, add to group
    if (currentPlayerSprite) {
      this.playerSpriteGroup.add(currentPlayerSprite);
    }

    R.forEachObjIndexed(this.addRemotePlayerToGroup, remotePlayerSprites);

    console.log('our player sprite group length: ', this.playerSpriteGroup.length);

    //TODO initialize game.remoteBulletGroup
    //TODO: call gun.shoot with this bulletGroup when a remote player is firing
    this.remoteBulletGroup = this.game.add.group();
    this.remoteBulletGroup.name = 'remoteBulletGroup';
  }

  updateCollisions () {
	  this.game.physics.arcade.collide(currentPlayerSprite, this.layers.backgroundDecCollision);
	  this.game.physics.arcade.collide(currentPlayerSprite, this.layers.backgroundDecCollision2);
	  this.game.physics.arcade.collide(currentPlayerSprite, this.layers.waterCollision);
	  this.game.physics.arcade.collide(currentPlayerSprite, this.layers.wallCollision);

	  //NOTE: check if remote bullets hit wallCollision - kill bullet
	  this.game.physics.arcade.collide(currentPlayerSprite.gun.gunBullets, this.layers.wallCollision, this.bulletHitWall, null, this);
  }



  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: currentPlayerSprite.x,
      y: currentPlayerSprite.y,
      name: currentPlayerSprite.name,
      animationDirection: currentPlayerSprite.direction,
	    gunRotation: currentPlayerSprite.gun.rotation,
      socketId: socket.id,
      pointerX: currentPlayerSprite.pointerX,
      pointerY: currentPlayerSprite.pointerY,
      health: currentPlayerSprite.stats.health
    }
    // console.log('just attached socket.id', socket.id);
    // console.log('my new CP obj: ', currentPlayer.socketId);
    store.dispatch(updateCurrentPlayer(currentPlayer));
  }

  //TODO: move remote player updates to other file
  updateRemotePlayers() {
    console.log('updating remote players has been called');
    this.players = store.getState().players.playerStates;
    if (this.players[socket.id]) delete this.players[socket.id];
    //then update each player from the server
    R.forEachObjIndexed(this.updateRemotePlayer, this.players);
  }

  updateRemotePlayer(playerState) {
    if (remotePlayerSprites[playerState.socketId]) {
      let playerToUpdate = remotePlayerSprites[playerState.socketId];
      console.log('updating this player: ', playerToUpdate);
      console.log('with this state from server: ', playerState);

      //NOTE: what do I need to know from the players?
      //      Implement other properties
      playerToUpdate.x = playerState.x;
      playerToUpdate.y = playerState.y;
      playerToUpdate.direction = playerState.animationDirection;
      playerToUpdate.gun.rotation = playerState.gunRotation;

      //if fire
      if (playerState.fire) {
        console.log('hes got a fire event for us!');
        //Remote player shoot
      }

      handleRemoteAnimation(playerToUpdate);
      tweenRemoteAssets(playerToUpdate, self);

      //TODO: not sure why they had this in here
      // this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);
    }
  }

  destroyCurrentPlayerSprite() {
    if (currentPlayerSprite) {
      currentPlayerSprite.destroy();
      // this line was from before CPS became global
      // delete currentPlayerSprite;
      currentPlayerSprite = null;
      console.log('deleted and destroyed currentPlayerSprite');
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
            texture: 'playerSpriteSheet',
            socketId: playerState.socketId
          },
        }, {x: playerState.x, y: playerState.y});
      self.game.add.existing(playerPrefab);
      remotePlayerSprites[playerState.socketId] = playerPrefab;
      remotePlayerSprites[playerState.socketId].gun.initializeWeapon(self);
      console.log('the created player sprite: ', playerPrefab);
      console.log('updated RPS after add: ', remotePlayerSprites);
    }
  }

  tweenRemoteAssets() {
	  //Remote Player Tweens
	  //TODO: refactor for 4 players
	  this.add.tween(remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].healthbar).to({
		  x: remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].x - 10,
		  y: remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].y - 30
	  }, 10, Phaser.Easing.Linear.None, true);

	  this.add.tween(remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].gun).to({
		  x: remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].x,
		  y: remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].y
	  }, 10, Phaser.Easing.Linear.None, true);

	  //TODO: send rotation angle of player to server, server sends it back and we use it to tween
	  remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].gun.rotation = remotePlayerSprites[Object.keys(remotePlayerSprites)[0]].gunRotation;
  }

  tweenCurrentPlayerAssets() {
    //gun follow does not work as a child of the player sprite.. had to tween gun to players x, y position
    this.add.tween(currentPlayerSprite.gun).to({
      x: currentPlayerSprite.x,
      y: currentPlayerSprite.y
    }, 10, Phaser.Easing.Linear.None, true);

    //Add tween for health
    this.add.tween(currentPlayerSprite.healthbar).to({
      x: currentPlayerSprite.x - 10,
      y: currentPlayerSprite.y - 30
    }, 10, Phaser.Easing.Linear.None, true);

    //Gun rotation tween
	  currentPlayerSprite.gun.rotation = this.game.physics.arcade.angleToPointer(currentPlayerSprite.gun);
  }

  handleRemotePlayerFire(fireObj) {
    if (fireObj.socketId === socket.id){
      console.log('i got into handleRemotePlayerFire with my own socket id?');
      return;
    }
    let playerWhoFired = remotePlayerSprites[fireObj.socketId];
    remotePlayerSprites[fireObj.socketId].pointerX = fireObj.pointerX;
    remotePlayerSprites[fireObj.socketId].pointerY = fireObj.pointerY;
    console.log('this motherfucker just fired: ', playerWhoFired);
    remotePlayerSprites[fireObj.socketId].gun.shoot(remotePlayerSprites[fireObj.socketId], self.remoteBulletGroup);
  }

  logRemotePlayers(){
    console.log('RPS: ', remotePlayerSprites);
    console.log('Local State: ', store.getState());
    console.log('CPS: ', currentPlayerSprite);
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
      console.log('bullet hit player');
      console.log('bullet: ', bullet );
      console.log('player: ', player);
      if (bullet.shooterSocketId === player.socketId){
        console.log('CANNOT BE DAMAGED BY OWN BULLET');
        return;
      }
      bullet.kill();
      if (bullet.parent.name === 'currentPlayerBulletGroup'){
        //TODO: emit to server
        console.log('my player:', currentPlayerSprite);
        socket.emit('shotPlayer', player.socketId, currentPlayerSprite.gun.damage);
        console.log('I HIT A MOTHERFUCKER');
      } else if (bullet.parent.name === 'remoteBulletGroup') {
        console.log('eh someone else hit someone');
      }
  }

  handlePlayerDamage(playerSocketId, dmgToTake){
    console.log('handle player damage');
    console.log('RPS in HPD: ', remotePlayerSprites);
    console.log('looking for: ', playerSocketId);
    let playerToDamage = remotePlayerSprites[playerSocketId];
    if (!playerToDamage){
      if (playerSocketId === socket.id){
        console.log('Ouch, Im damaging myself for: ', dmgToTake);
        playerToDamage = currentPlayerSprite;
      }
    }
    console.log(`this player will be hit for ${dmgToTake}`, playerToDamage);
    playerToDamage.receiveDamage(dmgToTake);
  }
}
