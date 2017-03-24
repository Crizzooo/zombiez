const R = require('ramda');
const throttle = require('lodash.throttle');
import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';
import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding';
import Lighting from '../plugins/Lighting';
import _ from 'lodash';

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

    //Control Mechanics
    this.game.cursors = {};
    this.game.cursors.up = this.input.keyboard.addKey(Phaser.Keyboard.W);
    this.game.cursors.down = this.input.keyboard.addKey(Phaser.Keyboard.S);
    this.game.cursors.left = this.input.keyboard.addKey(Phaser.Keyboard.A);
    this.game.cursors.right = this.input.keyboard.addKey(Phaser.Keyboard.D);
    this.game.cursors.jump = this.input.keyboard.addKey(Phaser.Keyboard.F);
    this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
    ///////////TODO: WIP
    this.currentEnemy.animations.play('left');

    //Remote Player Movement
    //This gets us the first player from the remote players
    console.log('this is remote player sprites', remotePlayerSprites);

    //Set camera to follow, then make world big to allow camera to pan off
    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
    this.game.world.setBounds(-250, -250, 3200 + 250, 3200 + 250);


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
    console.log('THIS IS ', this)
  }

  update() {
    //Check collisions
    //NOTE: only check CPS collissions if we do have a CPS
    if (this.currentPlayerSprite){
      this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
      this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
      this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
      this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);

      //NOTE: check if remote bullets hit wallCollision - kill bullet
      this.game.physics.arcade.collide(this.currentPlayerSprite.gun.gunBullets, this.layers.wallCollision, this.bulletHitWall, null, this);

      //NOTE: check if own bullets hit playerSprites - emit a hit
      this.game.physics.arcade.collide(this.currentPlayerSprite.gun.gunBullets, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

      //TODO: check if remote players hit any zombies - kill bullet, emit zombieHit

      //Set up local client lighting
      this.lightingPlugin.update();

      //Server & Input
      //every 32ms send package to server with position
      this.handleInput(this.currentPlayerSprite);
      this.dispatchCurrentPlayer();

      //Tween all player assets
      //Remote and current
      this.tweenCurrentPlayerAssets();
    }

    //collisions for remoteBulletGroups
    this.game.physics.arcade.collide(this.remoteBulletGroup, this.layers.wallCollision, this.bulletHitWall, null, this)
    this.game.physics.arcade.collide(this.remoteBulletGroup, this.playerSpriteGroup, this.bulletHitPlayer, null, this);

    //Pathfinding
	  //TODO: bug?
    if(this.currentEnemy.exists) {
			// console.log('still exists--------->')
      this.currentEnemy.moveTo(this.currentEnemy.acquireTarget());
      if (this.currentPlayerSprite){
        //NOTE: sprite zombie will always go first when comparing a group of sprites with a sprite
        this.game.physics.arcade.collide(this.currentEnemy, this.currentPlayerSprite.gun.gunBullets, this.bulletHitZombie, null, this);
      }
    }

    //Server & Input
    //every 32ms send package to server with position
    if (remotePlayerSprites[Object.keys(remotePlayerSprites)[0]]) {
      this.handleRemoteAnimation(remotePlayerSprites[Object.keys(remotePlayerSprites)[0]])
	    this.tweenRemoteAssets();
    }

    this.updateRemotePlayers();

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
            texture: 'playerSpriteSheet'
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
        health: this.currentPlayerSprite.stats.health
        //TODO: health, fire, guns, bullets, frame? etc
      }

      //add it to the world
      //this.game.add.existing(this.currentPlayerSprite);

      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }
    console.log('Creating Sprites for each player in this: ', state.players.playerStates);
    //)
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

  handleRemoteAnimation(player) {
    if (player) {
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;

      if (player.direction === 'idle') {
        player.animations.stop();
        //this.handlePlayerRotation(player);
      }

      if (player.direction === 'left') {
        player.animations.play('right');
        player.scale.setTo(-1, 1);
        player.body.velocity.x = -player.stats.movement;
        //this.handlePlayerRotation(player);

        //Tween for bounce
        switch (player.body.sprite._frame.name) {
          case 'lookingRightRightLegUp.png':
            player.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            player.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            player.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            player.body.velocity.y -= 50
        }
      }

      if (player.direction === 'right') {
        player.direction = 'right';
        player.scale.setTo(1, 1);
        player.animations.play('right');
        player.body.velocity.x = player.stats.movement;
        //this.handlePlayerRotation(player);

        //Tween for bounce
        switch (player.body.sprite._frame.name) {
          case 'lookingRightRightLegUp.png':
            player.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            player.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            player.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            player.body.velocity.y -= 50
        }
      }

      if (player.direction === 'up') {
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement;
        player.animations.play('up');
        //this.handlePlayerRotation(player);
      }

      if (player.direction === 'down') {
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement;
        player.animations.play('down');
        //this.handlePlayerRotation(player);
      }

    }
  }

  handleInput(player) {
    if (player) {
      this.currentPlayerSprite.pointerX = this.game.input.activePointer.worldX;
      this.currentPlayerSprite.pointerY = this.game.input.activePointer.worldY;

      player.body.velocity.x = 0;
      player.body.velocity.y = 0;

      if (this.spacebar.isDown) {
        //TODO: emit the shot to all clients
        socket.emit('userFire', {
          x: this.currentPlayerSprite.x,
          y: this.currentPlayerSprite.y,
          pointerX: this.currentPlayerSprite.pointerX,
          pointerY: this.currentPlayerSprite.pointerY,
          socketId: socket.id
        });
        this.currentPlayerSprite.gun.shoot(this.currentPlayerSprite, this.currentPlayerSprite.gun.gunBullets);
      }
      if (this.game.cursors.down.isDown && this.game.cursors.right.isDown){
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement;
        player.body.velocity.x = player.stats.movement;
        player.animations.play('down');
      } else if(this.game.cursors.down.isDown && this.game.cursors.left.isDown){
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement;
        player.body.velocity.x = -player.stats.movement;
        player.animations.play('down');
      } else if(this.game.cursors.up.isDown && this.game.cursors.left.isDown){
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement;
        player.body.velocity.x = -player.stats.movement;
        player.animations.play('up');
      } else if(this.game.cursors.up.isDown && this.game.cursors.right.isDown){
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement;
        player.body.velocity.x = player.stats.movement;
        player.animations.play('up');
      } else if(this.game.cursors.up.isDown && this.game.cursors.jump.isDown){
        player.animations.play('roll-up');
        player.body.velocity.y = -player.stats.movement - 100;
      } else if(this.game.cursors.down.isDown && this.game.cursors.jump.isDown){
        player.body.velocity.y = player.stats.movement + 100;
        player.animations.play('roll-down');
      } else if(this.game.cursors.right.isDown && this.game.cursors.jump.isDown){
        player.scale.setTo(1, 1);
        player.animations.play('roll-right');
        player.body.velocity.x = player.stats.movement + 100;
      } else if(this.game.cursors.left.isDown && this.game.cursors.jump.isDown){
        player.scale.setTo(-1, 1);
        player.animations.play('roll-right');
        player.body.velocity.x = -player.stats.movement - 100;
      } else if (this.game.cursors.left.isDown && !player.rollright.isPlaying) {
        player.direction = 'left';
        player.animations.play('right');
        player.scale.setTo(-1, 1);
        player.body.velocity.x = -player.stats.movement;
        //this.handlePlayerRotation(player);
      } else if (this.game.cursors.right.isDown && !player.rollright.isPlaying) {
        player.direction = 'right';
        player.scale.setTo(1, 1);
        player.animations.play('right');
        player.body.velocity.x = player.stats.movement;
        //this.handlePlayerRotation(player);
      } else if (this.game.cursors.up.isDown && !player.rollup.isPlaying) {
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement;
        player.animations.play('up');
        //this.handlePlayerRotation(player);
      } else if (this.game.cursors.down.isDown && !player.rolldown.isPlaying) {
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement;
        player.animations.play('down');
        //this.handlePlayerRotation(player);
      } else if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
        player.direction = 'idle';
        player.animations.stop();
        player.frame = this.handlePlayerRotation(player).frame;
      }
    }
  }

  handlePlayerRotation(player) {
    let pointerX = this.game.input.activePointer.worldX;
    let pointerY = this.game.input.activePointer.worldY;


    let playerX = player.x;
    let playerY = player.y;
    let frame;
    let animation;
    let gunScale;

    player.scale.setTo(1, 1);
    if ((pointerY > playerY) && (pointerX < playerX)) {
      //bottom-left
      if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 17;
      player.gun.scale.setTo(1, -1);
    }
    if ((pointerY > playerY) && (pointerX > playerX)) {
      //bottom-right
      if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 28;
      animation = 'down';
      // if(this.game.cursors.up.isDown && this.game.cursors.right.isDown) {
      //   animation = "right";
      // } else if(this.game.cursors.down.isDown && this.game.cursors.right.isDown){
      //   animation = "right";
      // } else if(this.game.cursors.left.isDown && this.game.cursors.down.isDown){
      //   animation = "right";
      // }
        player.gun.scale.setTo(1, 1);
    }
    if ((pointerY < playerY) && (pointerX > playerX)) {
      //top-right
      if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 14;
      animation = 'up';
      player.gun.scale.setTo(1, 1);
    }
    if ((pointerY < playerY) && (pointerX < playerX)) {
      //top-left
      if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 14;
      animation = 'up';
      player.gun.scale.setTo(1, -1);
    }
    return {
      frame,
      animation
    }
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
    this.add.tween(this.currentPlayerSprite.gun).to({
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y
    }, 10, Phaser.Easing.Linear.None, true);

    //Add tween for health
    this.add.tween(this.currentPlayerSprite.healthbar).to({
      x: this.currentPlayerSprite.x - 10,
      y: this.currentPlayerSprite.y - 30
    }, 10, Phaser.Easing.Linear.None, true);

    //Gun rotation tween
	  this.currentPlayerSprite.gun.rotation = this.game.physics.arcade.angleToPointer(this.currentPlayerSprite.gun);
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
