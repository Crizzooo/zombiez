/*global remotePlayerSprites*/
const R = require('ramda');
import _ from 'lodash';
const throttle = require('lodash.throttle');

import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import { dispatchZombieHitEvent } from '../reducers/zombies-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';

//Import game plugins and tiledstate
import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding';
import Lighting from '../plugins/Lighting';

//Import Helpers
import { handleInput, tweenCurrentPlayerAssets } from './zgsHelpers/handlePlayerInput';
import handleRemoteAnimation, { tweenRemoteAssets } from './zgsHelpers/handleRemoteAnimation';
import { enemyGeneratorInitial, enemyGenerator } from './zgsHelpers/enemyGenerator';
import {PLAYER_HEALTH, EVENT_LOOP_DELETE_TIME, STARTING_BULLET_SPEED} from '../engine/gameConstants.js';

 import { localZombieSprites, remoteZombieSprites, initializeZombies, createLocalZombie, updateLocalZombie, dispatchZombieUpdate, updateRemoteZombies } from '../engine/manageZombies.js';

//TODO: do we need this?
// currentPlayerSprite and remotePlayerSprites are on global window
var self;
let playerDamageEventCount = 0;
let zombieHitCount = 0;
export default class ZombieGameState extends TiledState {
  constructor(game) {
    super(game);

    //set constants for game
    self = this;

    //use this to keep track of bullet updates from server
    this.bulletHash = {};
    this.playerDamageHash = {};
  }

  init(levelData) {


    //Call super init to load in data;
    super.init.call(this, levelData);

    //Attach and bind functions
    this.destroyCurrentPlayerSprite = this.destroyCurrentPlayerSprite.bind(this);
    this.handleRemotePlayerLeave = this.handleRemotePlayerLeave.bind(this);
    this.throttledUpdateRemotePlayers = throttle(this.updateRemotePlayers.bind(this), 34);
    this.logRemotePlayer = throttle((playerState) => console.log('URP update: ', playerState), 1000);
    this.createRemotePlayerSprite = this.createRemotePlayerSprite.bind(this);

    //For updating remote players
    this.updateRemotePlayer = this.updateRemotePlayer.bind(this);
    this.handleRemoteBullet = this.handleRemoteBullet.bind(this);
    this.handleRemotePlayerDamageEvent = this.handleRemotePlayerDamageEvent.bind(this);

    this.displayEndGameText = R.once(this.displayEndGameText.bind(this));

    console.log(this.game.onBlur);

    document.getElementsByClassName("container")[0].style.visibility = "hidden";

    //console.log('ay',document.getElementsByClassName("container"))
    this.isInChat = false;
    //Sockets
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);



    // this.logPreZombie = throttle( () => { console.log('pre Zombie update',  store.getState()) }, 15000);
    // this.logPostZombie = throttle( () => { console.log('post Zombie update', store.getState()) }, 15000);
  }

  preload() {
    //this.load.audio('themeLoop','../../assets/sounds/themeLoop.wav');
    //this.load.audio('shoot','../../assets/sounds/shoot.ogg');
    //load assets that are specific for this level
    this.load.bitmapFont('carrier_command', '../../assets/fonts/carrier_command.png', '../../assets/fonts/carrier_command.xml');

  }

  create() {
    //Create game set up through tiled state by calling super
    //Loads level tilemap
    super.create.call(this);

    //adding sound here?
    this.soundLoop = this.game.add.audio('soundLoop', 1, true);
    this.shootSound = this.game.add.audio('shootSound');
    this.pistolReload = this.game.add.audio('pistolReload');
    this.lightPistolShot = this.game.add.audio('lightPistolShot');
    this.zombieSound = this.game.add.audio('zombieSound');
    //this.zombieHit = this.game.add.audio('zombieHit');
    this.heavyPistol = this.game.add.audio('heavyPistol');
    this.levelUp = this.game.add.audio('levelUp');
    this.playerHurt = this.game.add.audio('playerHurt');
    this.gameWin = this.game.add.audio('gameWin');
    this.reloadSuccess = this.game.add.audio('reloadSuccess');
    this.reloadFail = this.game.add.audio('reloadFail');
    let x = true;

    //Create worldGrid and tile dimensions for pathfinding
    //Load light plugin
    let worldGrid = this.createWorldGrid();
    this.tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, worldGrid, [-1], this.tileDimensions);
    this.lightingPlugin = new Lighting(this);

    // this.bmpText.inputEnabled = true;
    //Create Players and Temp Objects
    let crosshair = new Phaser.Sprite(this.game, 0, 0, 'crosshairSpriteSheet');

    //create game set up
    //This creates player prefab
    this.loadLevel();
// <<<<<<< HEAD
//
//     ///////////TODO: WIP
//     let enemyPrefab = this.createPrefab('zombie',
//       {
//         type: 'enemies',
//         properties: {
//           group: 'enemies',
//           initial: 9,
//           texture: 'zombieSpriteSheet'
//         }
//       }, {x: 200, y: 200});
//
//     // let reloadBar = this.createPrefab('reloadBar', {
//     //   type: 'guns',
//     //   properties: {
//     //     group: 'guns',
//     //     initial: 0,
//     //     texture: 'reloadBarSpriteSheet'
//     //   }
//     // }, {x: this.currentPlayerSprite.world.x, y: this.currentPlayerSprite.world.y + 10});
//
//     // this.reloadBar = reloadBar;
//     this.currentEnemy = enemyPrefab;
//     this.currentEnemy.moveTo = throttle(this.currentEnemy.moveTo, 1000);
//     this.currentEnemy.animations.play('left');
//
//     this.enemyGroup = this.game.add.group();
//     this.enemyGroup.name = 'enemySpriteGroup';
//     this.enemyGroup.add(enemyPrefab);
// =======
// >>>>>>> origin/master

    //Remote Player Movement
    //This gets us the first player from the remote players
    console.log('this is remote player sprites', remotePlayerSprites);

    //Set camera to follow, then make world big to allow camera to pan off
    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
    this.game.world.setBounds(-250, -250, 3200 + 250, 3200 + 250);

		//Enemy Generator Initial
	  // enemyGeneratorInitial(this,  10);
		console.log('enemy group', this.groups.enemies);

    // this.game = game;


    //set interval to emit currentPlayer to server
    //if we have a current player
    if (this.currentPlayerSprite) {

      this.pointer = crosshair;
      this.pointer.anchor.setTo(0.5);

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

		//This is lighting layers done manually
	  //ADD ALL LIGHTING MANUALLY FOR NOW UNTIL FINAL GROUPS ARE SET
		this.game.world.children.forEach((layer) => {
			if (layer.name === 'remotePlayerSpriteGroup' || layer.name === 'enemySpriteGroup') {
				//console.log('LAYER NAME', layer.name);
				this.lighting.mapSprite.addChild(layer);
			}
		})

	  //Loop through enemies group and add manually, adding by group fails
    this.groups.enemies.forEach( (enemy) => {
    	this.lighting.mapSprite.addChild(enemy);
    })

	  for (let key in remotePlayerSprites) {
		  if (remotePlayerSprites.hasOwnProperty(key)) {
			  console.log('remote player sprite of key', remotePlayerSprites[key])
			  this.lighting.mapSprite.addChild(remotePlayerSprites[key])
			  this.lighting.mapSprite.addChild(remotePlayerSprites[key].healthbar)
			  this.lighting.mapSprite.addChild(remotePlayerSprites[key].gun)
		  }
	  }

    //background music
    this.soundLoop.play();
	  for (let key in remotePlayerSprites) {
	    if (remotePlayerSprites.hasOwnProperty(key)) {
	      this.lighting.mapSprite.addChild(remotePlayerSprites[key])
		    this.lighting.mapSprite.addChild(remotePlayerSprites[key].healthbar)
      }
    }

    this.localZombieSpriteGroup = this.groups.localZombieSpriteGroup;
    this.remoteZombieSpriteGroup = this.groups.remoteZombieSpriteGroup;
	  console.log('this is game world', this.game.world)
	  console.log('this is groups', this.groups)

	  this.game.time.advancedTiming = true;
  }



  update() {
    //Check collisions
    //NOTE: only check CPS collissions if we do have a CPS

    if (this.currentPlayerSprite){
      this.pointer.x = this.game.input.mousePointer.worldX;
      this.pointer.y = this.game.input.mousePointer.worldY;
      this.updateCollisions();

      //Set up local client lighting
      this.lightingPlugin.update();

      //Server & Input
      //every 32ms send package to server with position
      handleInput(this.currentPlayerSprite);
      this.dispatchCurrentPlayer();
      if (this.currentPlayerSprite.stats.health <= 0) {
        this.currentPlayerSprite.resetHealth();
      }
      //not ideal, but gets the job done, will refactor later
      this.currentPlayerSprite.checkForRankUp(remotePlayerSprites);
      //Tween all player assets
      //Remote and current
      tweenCurrentPlayerAssets(this.currentPlayerSprite, this);
      // if(this.currentPlayerSprite.currentGunLevel === 3) this.currentPlayerSprite.checkKnifeDistance();
      //check to see if current player won
      if (this.currentPlayerSprite.hasWon) {
        this.displayEndGameText('You');
      }
    }

    //Pathfinding
	  this.groups.enemies.forEachExists((enemy) => {
	  	enemy.moveTo(enemy.acquireTarget(this.groups.player));
	  });

    //Server & Input
    //every 32ms send package to server with position
    //If there are remote clients, update their stuff
    if (!_.isEmpty(remotePlayerSprites)) {
      // this.throttledUpdateRemotePlayers();
      this.updateRemotePlayers();
    }

    //update zombies
    //move to one 'updateLocalZombies function'
    // this.logPreZombie();
    R.forEach(updateLocalZombie, this.localZombieSpriteGroup.children);
    dispatchZombieUpdate();
    // this.logPostZombie();
    updateRemoteZombies();
    //dispatch zombies
  }

  render() {
	  this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
  }

  //////////////////////////
  /// Non Phaser Methods ///
  //////////////////////////

  loadLevel() {
    let state = store.getState();

    //create a current player
    let currentPlayer;

    if (state.players.currentPlayer.name) {
      currentPlayer = state.players.currentPlayer;


      //TODO: make server assign sprite keys
      currentPlayerSprite = this.createPrefab(currentPlayer.name,
        {
          type: 'player',
          properties: {
            group: 'player',
            initial: 18,
            texture: 'playerSpriteSheet',
            socketId: socket.id
          },
        }, {x: currentPlayer.x, y: currentPlayer.y}); //change to new location from server


      //NOTE: Add bulletGroup to current player sprite
      //Create Bullet Groups
      //Current Player
      this.currentPlayerBulletGroup = this.game.add.group();
      this.currentPlayerBulletGroup.enableBody = true;
      this.currentPlayerBulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
      this.currentPlayerBulletGroup.setAll('outOfBoundsKill', true);
      this.currentPlayerBulletGroup.setAll('checkWorldBounds', true);
      this.currentPlayerBulletGroup.name = 'currentPlayerBulletGroup';
      this.currentPlayerBulletGroup.bulletSpeed = STARTING_BULLET_SPEED;

      // Attach bulletGroup to the CPS
      currentPlayerSprite.bulletGroup = this.currentPlayerBulletGroup;

      // Attach event hashes to the CPS obj
      currentPlayerSprite.bulletHash = {};
      currentPlayerSprite.playerDamageHash = {};

      // Store on game Object
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
        bulletHash: currentPlayerSprite.bulletHash,
        playerDamageHash: currentPlayerSprite.playerDamageHash
        //NOTE: pointerX and pointerY are attached in dispatch CP
        //TODO: gun, bullets, frame? etc
      };

      //add it to the world
      this.game.add.existing(currentPlayerSprite);
      store.dispatch(updateCurrentPlayer(currPlayerState));
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
    this.remotePlayerBulletGroup.bulletSpeed = STARTING_BULLET_SPEED;


    //TODO - create player sprite group using all in RPS, and CP sprite
    this.remotePlayerSpriteGroup = this.game.add.group();
    this.remotePlayerSpriteGroup.name = 'remotePlayerSpriteGroup';
    // this.remotePlayerSpriteGroup.enableBody = true;
    // this.remotePlayerSpriteGroup.physicsBodyType = Phaser.Physics.ARCADE;
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);

    console.log('our remote player sprite group: ', this.remotePlayerSpriteGroup.length);
    console.dir(this.remotePlayerSpriteGroup);

    console.log('initializing zombies....')
    initializeZombies(this);
    createLocalZombie(this, 200, 200);
    createLocalZombie(this, 220, 220);

  }

  updateCollisions () {
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);
	  this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.litWallCollision);

    //Note: not sure why this doesnt work - remotePlayerSpriteGroup?
    this.game.physics.arcade.collide(this.remotePlayerSpriteGroup, this.currentPlayerSprite);

    //this works
    this.game.physics.arcade.collide(this.currentPlayerBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this);

    //this works
    this.game.physics.arcade.collide(this.remotePlayerBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this);

    //this works
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.remotePlayerBulletGroup, this.bulletHitPlayer, null, this);

    //this works
    this.game.physics.arcade.collide(this.remotePlayerSpriteGroup, this.currentPlayerBulletGroup, this.bulletHitPlayer, null, this);

    //this works
    this.game.physics.arcade.collide(this.remotePlayerSpriteGroup, this.remotePlayerBulletGroup, this.bulletHitPlayer, null, this);


    //check collisions on  localZombies which will despatch event objects
    //CP Bullets & ZombieGameState
    // this.game.physics.arcade.collide(this.enemyGroup, this.currentPlayerBulletGroup,  this.bulletHitZombie, null, this);

    //check collisions on remoteZombies and kill the bullets

    //RP Bullets & Zombiez
    // this.game.physics.arcade.collide(this.enemyGroup, this.remotePlayerBulletGroup,  this.bulletHitZombie, null, this);


    //if current player hits a local or a remote zombie, they should dispatch an event

    //collision for CPS bullets on localZombies (dispatchEvent)
    this.game.physics.arcade.collide(this.localZombieSpriteGroup, this.currentPlayerBulletGroup, this.bulletHitZombie, null, this);
    //collision for CPS bullets on remoteZombies (dispatchEvent)
    this.game.physics.arcade.collide(this.remoteZombieSpriteGroup, this.remotePlayerBulletGroup, this.bulletHitZombie, null, this);

    //collision for RPS bullets on localZombies
    this.game.physics.arcade.collide(this.localZombieSpriteGroup, this.remotePlayerBulletGroup, this.bulletHitZombie, null, this);
    //collision for RPS bullets on remoteZombies
    this.game.physics.arcade.collide(this.remoteZombieSpriteGroup, this.remotePlayerBulletGroup, this.bulletHitZombie, null, this);
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
      playerDamageHash: this.currentPlayerSprite.playerDamageHash,
      pointerX: this.currentPlayerSprite.pointerX,
      pointerY: this.currentPlayerSprite.pointerY,
      gunFrame: this.currentPlayerSprite.gun.frame,
      hasWon: this.currentPlayerSprite.hasWon,
      currentGunLevel: this.currentPlayerSprite.currentGunLevel,
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
      let playerToUpdate = remotePlayerSprites[playerState.socketId];
      //NOTE: what do I need to know from the players?
      //      Implement other properties
      // console.log('CPS rotation', self.currentPlayerSprite.gun.rotation);
      // console.log('REM PLAYER GUN ROTATION: ', playerState.gun.rotation);
      // console.log('RPS gunRotation in update: ', playerState.gunRotation);
      playerToUpdate.x = playerState.x;
      playerToUpdate.y = playerState.y;
      playerToUpdate.direction = playerState.animationDirection;
      playerToUpdate.gun.rotation = playerState.gunRotation;
      playerToUpdate.gun.frame = playerState.gunFrame;
      playerToUpdate.hasWon = playerState.hasWon;
      playerToUpdate.currentGunLevel = playerState.currentGunLevel;
      playerToUpdate.pointerX = playerState.pointerX;
      playerToUpdate.pointerY = playerState.pointerY;
      // playerToUpdate.gun.rotation = playerState.gunRotation;
      playerToUpdate.pointer.x = playerToUpdate.pointerX;
      playerToUpdate.pointer.y = playerToUpdate.pointerY;
      // console.log('After updating RPS: ', playerToUpdate.gunRotation);

      if (playerState.bulletHash && Object.keys(playerState.bulletHash).length > 0) {
        // console.dir(this.bulletHash)
        playerToUpdate.pointerX = playerState.pointerX;
        playerToUpdate.pointerY = playerState.pointerY;

        //Update the player pointerX and pointerY so that player.gun.shoot


        //Loop through playerState.bulletHash and handle events that have not been handled
        R.forEachObjIndexed(this.handleRemoteBullet, playerState.bulletHash);
      }
      if (playerState.playerDamageHash && Object.keys(playerState.playerDamageHash).length > 0) {
        R.forEachObjIndexed(this.handleRemotePlayerDamageEvent, playerState.playerDamageHash);
      }
      handleRemoteAnimation(playerToUpdate);
      tweenRemoteAssets(playerToUpdate, self);
      if (playerToUpdate.hasWon) {
        this.displayEndGameText(playerToUpdate.name);
      }
    }
  }

  destroyCurrentPlayerSprite() {
    if (this.currentPlayerSprite) {
      this.currentPlayerSprite.gun.destroy();
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
      remotePlayerSprites[playerSocketId].healthbar.destroy();
      remotePlayerSprites[playerSocketId].gun.destroy();
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
      playerPrefab.pointer = new Phaser.Pointer(this.game, playerState.name);
      playerPrefab.gun.rotation = 1;
      this.game.add.existing(playerPrefab);
      this.remotePlayerSpriteGroup.children.push(playerPrefab);
      console.log('RPSG in create remotePlayerSprites ', this.remotePlayerSpriteGroup);
      remotePlayerSprites[playerState.socketId] = playerPrefab;
      remoteZombieSprites[playerState.socketId] = {};
    }
  }

  // addRemotePlayerToGroup(remotePlayerSprite){
  //   console.log('adding this RP to group: ', remotePlayerSprite);
  //   self.remotePlayerSpriteGroup.add(remotePlayerSprite);
  // }

  bulletHitWall(bullet, layer) {
    console.log('this bullet has hit a wall: ', bullet);
    if (bullet.parent.name === 'currentPlayerBulletGroup') {
      // console.log('i just hit a fucking wall, I suck');
    } else if (bullet.parent.name === 'remotePlayerBulletGroup') {
      // console.log('remote player bullet just hit a fucking wall, ok??');
    }
    bullet.kill();
  }

  //NOTE: I have may messed this merge up.... pls check
  bulletHitZombie(zombie, bullet){
    bullet.kill();
    console.log("ZOMBIE HIT BY BULLET", zombie, bullet);
    if (bullet.shooterSocketId === socket.id){
      //TODO: dispatch event and let everyone know its been hit
      //dispatch event and let everyone know its been hit
      console.log('i hit a zombie so I should let other people know ');
      let eventId =  'shotZombie' + socket.id + zombieHitCount;
      store.dispatch(dispatchZombieHitEvent({
          zombieId: zombie.id,
          damage: currentPlayerSprite.gun.damage,
          shooterId: socket.id,
          zombieOwnerId: zombie.ownerId
      }, eventId));
      zombieHitCount++;
      this.killZombie(zombie);
    }
  }

  killZombie(zombie){
    zombie.hit = true;
    zombie.animations.stop();
    zombie.animations.play('dead')
    zombie.animations.currentAnim.onComplete.add( () => {
      zombie.kill();
    });

    const zX =  zombie.x;
	  const zY =  zombie.y;

	  let zombieDyingPrefab = this.createPrefab('zombieDead',
		  {
			  type: 'enemies',
			  properties: {
				  initial: 9,
				  texture: 'zombieSpriteSheet'
			  }
		  }, {x: zX, y: zY});

	  this.lighting.mapSprite.addChild(zombieDyingPrefab);
	  zombieDyingPrefab.animations.play('dead');


	  this.game.time.events.add(Phaser.Timer.SECOND * 4, () => {
	  	zombieDyingPrefab.destroy();
	  });
  }

  bulletHitPlayer(player, bullet) {
    // console.log("PLAYER X AND Y", player.x, player.y);
    // console.log("DISTANCE!!!!!!!!!", Math.sqrt(Math.pow((this.currentPlayerSprite.x - player.x), 2) + Math.pow((this.currentPlayerSprite.y - player.y), 2) ));
    bullet.kill();
    console.log('this bullet has hit a player: ', player);
    if (bullet.shooterSocketId === player.socketId) {
      console.log('cant damage self');
      return;
    } else if (bullet.parent.name === 'currentPlayerBulletGroup') {
      //TODO: add damage event
      let eventId = socket.id + playerDamageEventCount;
      console.log('bullet hit player for X damage: ', currentPlayerSprite.gun.damage);
      //dmg was set to 10 before, now is it gun damage?
      self.currentPlayerSprite.playerDamageHash[eventId] = {
        damagedPlayerSocketId: player.socketId,
        damage: currentPlayerSprite.gun.damage
      }
      setTimeout(() => {
        delete self.currentPlayerSprite.playerDamageHash[eventId];
      }, EVENT_LOOP_DELETE_TIME);

      // console.log('the event Im creating: ', self.currentPlayerSprite.playerDamageHash);

      //get the remote player sprite and invoke its damage function
      this.handlePlayerDamage(player.socketId, self.currentPlayerSprite);
      //increment playerDamageCount
      playerDamageEventCount++;

    } else if (bullet.parent.name === 'remotePlayerBulletGroup') {
      if (player.socketId === socket.id) {
        // console.log(' I GOT HIT');
      } else {
        // console.log('eh someone else hit someone');
      }
    }
  }

  handlePlayerDamage(playerSocketId, playerWhoDealtDamage) {
    // console.log('handle player damage');
    // console.log('RPS in HPD: ', remotePlayerSprites);
    // console.log('looking for: ', playerSocketId);
    let playerToDamage = remotePlayerSprites[playerSocketId];
    if (!playerToDamage) {
      if (playerSocketId === socket.id) {
        console.log('Ouch, Im damaging myself for: ', playerWhoDealtDamage);
        playerToDamage = currentPlayerSprite;
      }
      console.error('player not found');
    }
    // console.log(`this player will be hit for ${playerWhoDealtDamage}`, playerToDamage);
    if ( (playerToDamage.stats.health - playerWhoDealtDamage.gun.damage) <= 0 ){
      console.log('im about to kill a player');
      playerWhoDealtDamage.upgradeGun();
      playerWhoDealtDamage.checkForRankUp(remotePlayerSprites);
      playerToDamage.receiveDamage(playerWhoDealtDamage.gun.damage);
      playerToDamage.resetHealth();
    } else {
      playerToDamage.receiveDamage(playerWhoDealtDamage.gun.damage);
    }
  }

  handleRemoteBullet(bulletEvent, bulletId) {
    let playerWhoFired = remotePlayerSprites[bulletEvent.socketId];
    //if key is not in our hash map
    if (this.bulletHash[bulletId] !== true) {
      playerWhoFired.gun.shoot(playerWhoFired);
      this.bulletHash[bulletId] = true;
      //set a timeout to remove it from hashmap after the client has taken it off their event loop
      setTimeout(() => {
        delete this.bulletHash[bulletId];
      }, EVENT_LOOP_DELETE_TIME * 1.5);
    }
    // we make the timeout a little longer than how long the client emits for, in case we
    // getState a delayed server update after weve cleared our bullet process
    // we do not want to process the bullet again
  }

  handleRemotePlayerDamageEvent(damageEvent, damageEventId) {
    let playerToDamage;
    if (damageEvent.damagedPlayerSocketId === socket.id) {
      playerToDamage = this.currentPlayerSprite;
    } else {
      playerToDamage = remotePlayerSprites[damageEvent.damagedPlayerSocketId];
    }

    if (!playerToDamage) {
      console.error('could not find the id of the player to take damage from event: ', damageEvent);
    }
    //if key is not in our hash map)
    if (this.playerDamageHash[damageEventId] !== true){
      playerToDamage.receiveDamage(damageEvent.damage);
      this.playerDamageHash[damageEventId] = true;
      //set a timeout to remove it from hashmap after the client has taken it off their event loop
      setTimeout(() => {
        delete this.playerDamageHash[damageEventId];
      }, EVENT_LOOP_DELETE_TIME * 1.5);
    }
    // we make the timeout a little longer than how long the client emits for, in case we
    // getState a delayed server update after weve cleared our bullet process
    // we do not want to process the bullet again
  }

  displayEndGameText(name){
    this.bmpText = this.game.add.bitmapText(100, 100, 'carrier_command', name + ' won!!', 34);
    this.bmpText.fixedToCamera = true;
    document.body.style.cursor = 'pointer';
  }

}
