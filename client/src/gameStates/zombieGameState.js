const R = require('ramda');
const throttle = require('lodash.throttle');
import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';
import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding';
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
    this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Attach and bind functions
    this.destroyCurrentPlayerSprite = this.destroyCurrentPlayerSprite.bind(this);
    this.handleRemotePlayerLeave = this.handleRemotePlayerLeave.bind(this);
    socket.on('destroyCurrentPlayerSprite', this.destroyCurrentPlayerSprite);
    socket.on('playerLeaveGame', this.handleRemotePlayerLeave);
  }

  preload() {
    //load assets that are specific for this level
  }

  create() {
    //Create game set up through tiled state by calling super
    super.create.call(this);

    //Create worldGrid and tile dimensions for pathfinding
    let worldGrid = this.createWorldGrid();
    this.tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, worldGrid, [-1], this.tileDimensions);

    //Create Players and Temp Objectsw
    let crosshair = new Phaser.Sprite(this.game, 0, 0, 'crosshairSpriteSheet');

    let enemyPrefab = this.createPrefab('zombie',
      {
        type: 'enemies',
        properties: {
          group: 'enemies',
          initial: 9,
          texture: 'zombieSpriteSheet'
        }
      }, {x: 200, y: 200});

    //create game set up
    //This creates player prefab
    console.log('Local state right before load level: ', store.getState())
    this.loadLevel();

    console.log('bug here or after?');
    this.currentPlayerSprite.gun.initializeWeapon(this);
    console.log('could we access gun on CPS?');
    console.log(this);
    this.pointer = crosshair;
    this.currentEnemy = enemyPrefab;

    //add to world
    this.game.add.existing(this.currentEnemy);
    this.game.add.existing(this.pointer);

    //this.currentEnemy.acquireTarget = throttle(this.currentEnemy.acquireTarget, 200);
    this.currentEnemy.moveTo = throttle(this.currentEnemy.moveTo, 1000);
    ///////////TODO: WIP
    this.currentEnemy.animations.play('left');

    //Remote Player Movement
    //This gets us the first player from the remote players
    console.log('this is remote player sprites', remotePlayerSprites[Object.keys(remotePlayerSprites)[0]]);

    //Set camera to follow, then make world big to allow camera to pan off
    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
    this.game.world.setBounds(-250, -250, 2500, 2500);


    //set interval to emit currentPlayer to server
    //if we have a current player
    if (this.currentPlayerSprite) {
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
  }

  update() {
    //Check collisions
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);

    //constantly check if bullet hit a wall
    this.game.physics.arcade.collide(this.layers.wallCollision, this.currentPlayerSprite.gun.gunBullets, this.currentPlayerSprite.gun.hitWall, null, this);

	  console.log("this is enemy", this.currentEnemy.exists);
    //Pathfinding
	  //TODO: bug?
    if(this.currentEnemy.exists) {
			console.log('still exists--------->')
      this.currentEnemy.moveTo(this.currentEnemy.acquireTarget());
      this.game.physics.arcade.collide(this.currentEnemy, this.currentPlayerSprite.gun.gunBullets, this.currentPlayerSprite.gun.hitZombie, null, this);
    }

    //Tween all player assets
	  //Remote and current
    this.tweenPlayerAssets();


    //Server & Input
    //every 32ms send package to server with position
    if (remotePlayerSprites[Object.keys(remotePlayerSprites)[0]]) {
      this.handleRemoteAnimation(remotePlayerSprites[Object.keys(remotePlayerSprites)[0]])
	    this.tweenRemoteAssets();
    }

    if (this.currentPlayerSprite) {
      this.handleInput(this.currentPlayerSprite);
      this.dispatchCurrentPlayer();
    }


    //Server & Input
    //every 32ms send package to server with position
    if (this.currentPlayerSprite) {
      this.handleInput();
      this.dispatchCurrentPlayer();
    }

    this.updateRemotePlayers();
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
        name: currentPlayer.name
        //TODO: health, fire, guns, bullets, frame? etc
      }

      //add it to the world
      this.game.add.existing(this.currentPlayerSprite);

      store.dispatch(updateCurrentPlayer(currPlayerState));
      console.log('end of load level local store looks like: ', store.getState());
    }
    console.log('Creating Sprites for each player in this: ', state.players.playerStates);
    //)
    R.forEachObjIndexed(this.createRemotePlayerSprite, state.players.playerStates);
  }

  handleRemoteAnimation(player) {
    if (player) {
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;

      console.log('player direction', player.direction)

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
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;

      if (this.spacebar.isDown) {
        this.currentPlayerSprite.gun.shoot(this.currentPlayerSprite);
      }

      if (this.game.cursors.left.isDown) {
        player.direction = 'left';
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

      if (this.game.cursors.right.isDown) {
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

      if (this.game.cursors.up.isDown) {
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement;
        player.animations.play('up');
        //this.handlePlayerRotation(player);
      }

      if (this.game.cursors.down.isDown) {
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement;
        player.animations.play('down');
        //this.handlePlayerRotation(player);
      }

      if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
        player.direction = 'idle';
        player.animations.stop();

        this.handlePlayerRotation(player);
      }
    }
  }

  handlePlayerRotation(player) {
    let pointerX = this.game.input.activePointer.worldX;
    let pointerY = this.game.input.activePointer.worldY;
    let playerX = player.x;
    let playerY = player.y

    player.scale.setTo(1, 1);
    if ((pointerY > playerY) && (pointerX < playerX)) {
      player.frame = 17;
      player.gun.scale.setTo(1, -1);
    }
    if ((pointerY > playerY) && (pointerX > playerX)) {
      player.frame = 18;
      player.gun.scale.setTo(1, 1);
    }
    if ((pointerY < playerY) && (pointerX > playerX)) {
      player.frame = 14;
      player.gun.scale.setTo(1, 1);
    }
    if ((pointerY < playerY) && (pointerX < playerX)) {
      player.frame = 14;
      player.gun.scale.setTo(1, -1);
    }
  }

  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      name: this.currentPlayerSprite.name,
      animationDirection: this.currentPlayerSprite.direction,
	    gunRotation: this.currentPlayerSprite.gun.rotation,
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

    this.game.canvas.addEventListener('mousedown', () => {
      this.game.canvas.addEventListener('mousemove', () => {
        this.pointer.x = this.game.input.activePointer.worldX;
        this.pointer.y = this.game.input.activePointer.worldY;
      });
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
      console.log('the created player sprite: ', playerPrefab);
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

  tweenPlayerAssets() {
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
}
