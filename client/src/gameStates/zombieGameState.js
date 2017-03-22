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

    let gunPrefab = this.createPrefab('gun', {
      type: 'guns',
      properties: {
        group: 'guns',
        initial: 0,
        texture: 'gunSpriteSheet'
      }
    }, {x: 225, y: 225});

    //create game set up
    //This creates player prefab
    console.log('Local state right before load level: ', store.getState())
    this.loadLevel();

    //set interval to emit currentPlayer to server
    //if we have a current player
    if (this.currentPlayerSprite) {
      const emitInterval = emitCurrentState(socket);
    }

    //Add test prefabs into the game
    this.gun = gunPrefab;
    //initialize gun and load with finite amount of bullets
    this.gun.initializeWeapon(this);
    console.log(this);
    console.log("THIS IS ZOMBIE STATE GUN", this.gun);

    this.pointer = crosshair;
    this.currentEnemy = enemyPrefab;

    //this.currentEnemy.acquireTarget = throttle(this.currentEnemy.acquireTarget, 200);
    this.currentEnemy.moveTo = throttle(this.currentEnemy.moveTo, 1000);

    this.game.add.existing(this.currentPlayerSprite);
    this.game.add.existing(this.currentEnemy);
    this.game.add.existing(this.pointer);
    this.game.add.existing(this.gun);

    //on click lock the users mouse for input
    this.game.input.onDown.add(this.lockPointer, this);

    //Set camera to follow, then make world big to allow camera to pan off
    //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
    this.camera.follow(this.currentPlayerSprite);
    this.game.world.setBounds(-250, -250, 2500, 2500);

    ///////////TODO: WIP
    this.currentEnemy.animations.play('left');
  }

  update() {
    //Check Physics
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.backgroundDecCollision2);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.waterCollision);
    this.game.physics.arcade.collide(this.currentPlayerSprite, this.layers.wallCollision);
    //constantly check if bullet hit a wall
    this.game.physics.arcade.collide(this.layers.wallCollision, this.gun.gunBullets, this.gun.hitWall, null, this);
    this.game.physics.arcade.collide(this.currentEnemy, this.gun.gunBullets, this.gun.hitZombie, null, this);




    //Gun Rotation
    this.tweenPlayerAssets();
    this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);

    //Pathfinding
    this.currentEnemy.moveTo(this.currentEnemy.acquireTarget());


    //Server & Input
    //every 32ms send package to server with position
    if (this.currentPlayerSprite) {
      this.handleInput();
      this.dispatchCurrentPlayer();
    }

    this.updateRemotePlayers();
  }

  render() {
    this.game.debug.spriteInfo(this.gun, 32, 32);
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
    if (state.players.currentPlayer.socketId) {
      currentPlayer = state.players.currentPlayer;
      //TODO: make server assign sprite keys
      let playerPrefab = this.createPrefab('player',
        {
          type: 'player',
          properties: {
            group: 'player',
            initial: 18,
            texture: 'playerSpriteSheet'
          },
        }, {x: 225, y: 225});

      this.currentPlayerSprite = playerPrefab;

      //store on game Object
      console.log('created current Player: ', this.currentPlayerSprite);

      //create currentPlayer
      let currPlayerState = {
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
    if (this.currentPlayerSprite) {
      let pointerX = this.game.input.activePointer.worldX;
      let pointerY = this.game.input.activePointer.worldY;
      let playerX = this.currentPlayerSprite.x;
      let playerY = this.currentPlayerSprite.y

      this.currentPlayerSprite.body.velocity.x = 0;
      this.currentPlayerSprite.body.velocity.y = 0;

      if (this.spacebar.isDown) {
        this.gun.shoot(this.currentPlayerSprite);
      }

      if (this.game.cursors.left.isDown) {
        this.currentPlayerSprite.animations.play('right');
        this.currentPlayerSprite.scale.setTo(-1, 1);
        this.currentPlayerSprite.body.velocity.x = -this.currentPlayerSprite.stats.movement;
        switch (this.currentPlayerSprite.body.sprite._frame.name) {
          case 'lookingRightRightLegUp.png':
            this.currentPlayerSprite.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            this.currentPlayerSprite.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            this.currentPlayerSprite.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            this.currentPlayerSprite.body.velocity.y -= 50
        }
      }

      if (this.game.cursors.right.isDown) {
        this.currentPlayerSprite.scale.setTo(1, 1);
        this.currentPlayerSprite.animations.play('right');
        this.currentPlayerSprite.body.velocity.x = this.currentPlayerSprite.stats.movement;
        switch (this.currentPlayerSprite.body.sprite._frame.name) {
          case 'lookingRightRightLegUp.png':
            this.currentPlayerSprite.body.velocity.y -= 80;
            break;
          case 'RightComingDown1.png':
            this.currentPlayerSprite.body.velocity.y += 80;
            break;
          case 'movingRight4.png':
            this.currentPlayerSprite.body.velocity.y += 50;
            break;
          case 'playerSprites_266 copy.png':
            this.currentPlayerSprite.body.velocity.y -= 50
        }
      }

      if (this.game.cursors.up.isDown) {
        this.currentPlayerSprite.body.velocity.y = -this.currentPlayerSprite.stats.movement;
        this.currentPlayerSprite.animations.play('up');
      }

      if (this.game.cursors.down.isDown) {
        this.currentPlayerSprite.body.velocity.y = this.currentPlayerSprite.stats.movement;
        this.currentPlayerSprite.animations.play('down');
      }

      if (this.currentPlayerSprite.body.velocity.x === 0 && this.currentPlayerSprite.body.velocity.y === 0) {
        this.currentPlayerSprite.animations.stop();
        //console.log("pointer on rest", this.game.input.activePointer.worldX, this.game.input.activePointer.worldY);
        //console.log("player position on rest", this.currentPlayerSprite.x, this.currentPlayerSprite.y);
        this.currentPlayerSprite.scale.setTo(1, 1);
        if ((pointerY > playerY) && (pointerX < playerX)) {
          this.currentPlayerSprite.frame = 17;
          this.gun.scale.setTo(1, -1);
        }
        if ((pointerY > playerY) && (pointerX > playerX)) {
          this.currentPlayerSprite.frame = 18;
          this.gun.scale.setTo(1, 1);
        }
        if ((pointerY < playerY) && (pointerX > playerX)) {
          this.currentPlayerSprite.frame = 14;
          this.gun.scale.setTo(1, 1);
        }
        if ((pointerY < playerY) && (pointerX < playerX)) {
          this.currentPlayerSprite.frame = 14;
          this.gun.scale.setTo(1, -1);
        }
      }
    }
  }

  dispatchCurrentPlayer() {
    let currentPlayer = {
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y,
      //animationDirection: this.currentPlayerSprite.animationDirection,
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
    let state = store.getState();

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
    if (playerState.socketId !== socket.id) {
      console.log('creating remote player with this playerState: ', playerState);
      let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
      remotePlayerSprites[playerState.socketId] = remoteSprite;
    }
  }

  tweenPlayerAssets() {
    //gun follow does not work as a child of the player sprite.. had to tween gun to players x, y position
    this.add.tween(this.gun).to({
      x: this.currentPlayerSprite.x,
      y: this.currentPlayerSprite.y
    }, 10, Phaser.Easing.Linear.None, true);

    //Add tween for health
    this.add.tween(this.currentPlayerSprite.healthbar).to({
      x: this.currentPlayerSprite.x - 10,
      y: this.currentPlayerSprite.y - 30
    }, 10, Phaser.Easing.Linear.None, true);
  }
}