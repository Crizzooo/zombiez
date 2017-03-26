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

    //use this to keep track of bullet updates from server
    this.bulletHash = {};
  }

  init(levelData) {
    //Call super init to load in data;
    super.init.call(this, levelData);

    //Attach and bind functions
    this.destroyCurrentPlayerSprite = this.destroyCurrentPlayerSprite.bind(this);
    this.handleRemotePlayerLeave = this.handleRemotePlayerLeave.bind(this);
    this.throttledUpdateRemotePlayers = throttle(this.updateRemotePlayers.bind(this), 34);
    this.logRemotePlayer = throttle( (playerState) => console.log('URP update: ', playerState), 1000);
    this.createRemotePlayerSprite = this.createRemotePlayerSprite.bind(this);
    this.updateRemotePlayer = this.updateRemotePlayer.bind(this);


    //Throttled Console logs
	  this.throttledRPS = throttle(this.logRemotePlayers, 20000);

    //Sockets
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);
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


    // this.game = game;


    //set interval to emit currentPlayer to server
    //if we have a current player
    if (this.currentPlayerSprite) {

      this.pointer = crosshair;

      //add to world
      this.game.add.existing(this.pointer);

      const emitInterval = emitCurrentState(socket);

      //on click lock the users mouse for input
      this.game.input.onDown.add(this.lockPointer, this);

      //Only follow current player if we have a current player
      this.camera.follow(this.currentPlayerSprite);
    } else {
      //follow the first remote player if you are a spectator
      //TODO: let spectators change who they are viewing
      // OR:  set a timeout to switch between player views
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
    if (this.currentPlayerSprite){
      //NOTE: check if remote bullets hit wallCollision - kill bullet
      // this.game.physics.arcade.collide(currentPlayerSprite.gun.gunBullets, this.layers.wallCollision, this.bulletHitWall, null, this);


      //NOTE: check if own bullets hit playerSprites - emit a hit
      // this.game.physics.arcade.collide(currentPlayerSprite.gun.gunBullets, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

      this.updateCollisions();

      //Set up local client lighting
      this.lightingPlugin.update();

      //Server & Input
      //every 32ms send package to server with position
      handleInput(this.currentPlayerSprite);
      this.dispatchCurrentPlayer();

      //Tween all player assets
      //Remote and current
      tweenCurrentPlayerAssets(this.currentPlayerSprite, this);


      //collisions for remoteBulletGroups
      // this.game.physics.arcade.collide(this.remoteBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this)
  	  // this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

    }


    //Server & Input
    //every 32ms send package to server with position
	  //If there are remote clients, update their stuff
    if (!_.isEmpty(remotePlayerSprites)) {
	    // this.throttledUpdateRemotePlayers();
      this.updateRemotePlayers();
      this.throttledRPS();
    }
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
      let currentPlayerSprite = this.createPrefab(currentPlayer.name,
        {
          type: 'player',
          properties: {
            group: 'player',
            initial: 18,
            texture: 'playerSpriteSheet',
            socketId: socket.id
          },
        }, {x: 225, y: 225}); //change to new location from server


      //NOTE: Add bulletGroup to current player sprite
      //Create Bullet Groups
      //Current Player
      this.currentPlayerBulletGroup = this.game.add.group();
      this.currentPlayerBulletGroup.enableBody = true;
      this.currentPlayerBulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
      this.currentPlayerBulletGroup.setAll('outOfBoundsKill', true);
      this.currentPlayerBulletGroup.setAll('checkWorldBounds', true);
      this.currentPlayerBulletGroup.name = 'currentPlayerBulletGroup';
      this.currentPlayerBulletGroup.bulletSpeed = 600;

      //Attach it to player.bulletGroup
      currentPlayerSprite.bulletGroup = this.currentPlayerBulletGroup;

      currentPlayerSprite.bulletHash = {};

      //store on game Object
      this.currentPlayerSprite = currentPlayerSprite;

      //create currentPlayer
      let currPlayerState = {
        x: currentPlayerSprite.x,
        y: currentPlayerSprite.y,
        name: currentPlayer.name,
        animationDirection: currentPlayerSprite.direction,
        gunRotation: currentPlayerSprite.gun.rotation,
        socketId: socket.id,
        health: PLAYER_HEALTH,
        bulletHash: currentPlayerSprite.bulletHash
        //NOTE: pointerX and pointerY are attached in dispatch CP
        //TODO: health, gun, bullets, frame? etc
      }

      //add it to the world
      this.game.add.existing(currentPlayerSprite);
      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }

    //Now initialize for Remote Player Sprites

    //create group for remote bullets
    //Remote Player
    this.remotePlayerBulletGroup = this.game.add.group();
    this.remotePlayerBulletGroup.enableBody = true;
    this.remotePlayerBulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
    this.remotePlayerBulletGroup.setAll('outOfBoundsKill', true);
    this.remotePlayerBulletGroup.setAll('checkWorldBounds', true);
    this.remotePlayerBulletGroup.name = 'remotePlayerBulletGroup';
    this.remotePlayerBulletGroup.bulletSpeed = 600;


    //TODO - create player sprite group using all in RPS, and CP sprite
    this.remotePlayerSpriteGroup = this.game.add.group();
    this.remotePlayerSpriteGroup.name = 'remotePlayerSpriteGroup';
    // this.remotePlayerSpriteGroup.enableBody = true;
    // this.remotePlayerSpriteGroup.physicsBodyType = Phaser.Physics.ARCADE;
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);

    console.log('our remote player sprite group: ', this.remotePlayerSpriteGroup.length);
    console.dir(this.remotePlayerSpriteGroup);
  }

  updateCollisions () {
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);

    //Note: not sure why this doesnt work - remotePlayerSpriteGroup?
    this.game.physics.arcade.overlap(this.remotePlayerSpriteGroup, this.currentPlayerSprite, this.bulletHitWall );

    //this works
	  this.game.physics.arcade.collide(this.currentPlayerBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this);

    //this works
    this.game.physics.arcade.collide(this.remotePlayerBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this);

    //this works
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.remotePlayerBulletGroup, this.bulletHitPlayer, null, this);

    //thjis works
    this.game.physics.arcade.collide(this.remotePlayerSpriteGroup, this.currentPlayerBulletGroup, this.bulletHitPlayer, null, this);

    //needs to be tested
    this.game.physics.arcade.collide(this.remotePlayerSpriteGroup, this.remotePlayerBulletGroup, this.bulletHitPlayer, null, this);

  }



  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      name: this.currentPlayerSprite.name,
      animationDirection: this.currentPlayerSprite.direction,
	    gunRotation: this.currentPlayerSprite.gun.rotation,
      socketId: socket.id,
      health: this.currentPlayerSprite.stats.health,
      bulletHash: this.currentPlayerSprite.bulletHash,
      pointerX: this.currentPlayerSprite.pointerX,
      pointerY: this.currentPlayerSprite.pointerY
    }

    if (Object.keys(currentPlayer.bulletHash).length > 0){
      console.log('DISPATCHED A BULLET HASH!');
      console.dir(currentPlayer.bulletHash);
    }
    // console.log('just attached socket.id', socket.id);
    // console.log('my new CP obj: ', currentPlayer.socketId);
    store.dispatch(updateCurrentPlayer(currentPlayer));
  }

  //TODO: move remote player updates to other file
  updateRemotePlayers() {
    // console.log('updating remote players has been called');
    this.players = store.getState().players.playerStates;
    // console.log('player to update: ', this.players);
    if (this.players[socket.id]) delete this.players[socket.id];
    //then update each player from the server
    R.forEachObjIndexed(this.updateRemotePlayer, this.players);
  }


  updateRemotePlayer(playerState) {

    if (remotePlayerSprites[playerState.socketId]) {
      let playerToUpdate = remotePlayerSprites[playerState.socketId];
      this.logRemotePlayer(playerState);
      // console.log('updating this player: ', playerToUpdate);
      // console.log('with this state from server: ', playerState);

      //NOTE: what do I need to know from the players?
      //      Implement other properties
      playerToUpdate.x = playerState.x;
      playerToUpdate.y = playerState.y;
      playerToUpdate.direction = playerState.animationDirection;
      playerToUpdate.gun.rotation = playerState.gunRotation;

      handleRemoteAnimation(playerToUpdate);
      tweenRemoteAssets(playerToUpdate, self);

      //TODO: not sure why they had this in here
      // this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);
    }
  }

  destroyCurrentPlayerSprite() {
    if (this.currentPlayerSprite) {
      this.currentPlayerSprite.destroy();
      // this line was from before CPS became global
      // delete currentPlayerSprite;
      this.currentPlayerSprite = null;
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

      //TODO: Add bullet group to the player prefab
      playerPrefab.bulletGroup = self.remotePlayerBulletGroup;
      //Add remote sprite to the remotePlayerSpriteGroup
      this.game.add.existing(playerPrefab);
      console.log('p prefab', playerPrefab);
      this.remotePlayerSpriteGroup.children.push(playerPrefab);
      console.log('RPSG in create remotePlayerSprites ', this.remotePlayerSpriteGroup);


      remotePlayerSprites[playerState.socketId] = playerPrefab;


      console.dir(playerPrefab, { depth: 4});
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

  logRemotePlayers(){
    // console.log('RPS: ', remotePlayerSprites);
    // console.log('Local State: ', store.getState());
    // console.log('CPS: ', currentPlayerSprite);
  }

  // addRemotePlayerToGroup(remotePlayerSprite){
  //   console.log('adding this RP to group: ', remotePlayerSprite);
  //   self.remotePlayerSpriteGroup.add(remotePlayerSprite);
  // }

  bulletHitWall(bullet, layer){
    console.log('this bullet has hit a wall: ', bullet);
    if (bullet.parent.name === 'currentPlayerBulletGroup'){
      console.log('i just hit a fucking wall, I suck');
    } else if (bullet.parent.name === 'remotePlayerBulletGroup') {
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

  bulletHitPlayer(player, bullet){
      console.log('bullet hit player');
      console.log('bullet: ', bullet );
      console.log('hit player: ', player);
      // if (bullet.shooterSocketId === player.socketId){
      //   console.log('CANNOT BE DAMAGED BY OWN BULLET');
      //   return;
      // }
      if (bullet.parent.name === 'currentPlayerBulletGroup'){
        //TODO: emit to server
        console.log('my player:', self.currentPlayerSprite);
        // socket.emit('shotPlayer', player.socketId, currentPlayerSprite.gun.damage);
        console.log('I HIT SOMEONE');
      } else if (bullet.parent.name === 'remotePlayerBulletGroup') {
        if (player.socketId === socket.id){
          console.log(' I GOT HIT');
        }
        console.log('eh someone else hit someone');
      }
      bullet.kill();
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
