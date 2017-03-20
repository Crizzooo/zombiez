const R = require('ramda');
const throttle = require('lodash.throttle');

import store from '../store.js';
import {updateCurrentPlayer, playerLeaveGame} from '../reducers/players-reducer.js';
import emitCurrentState from '../engine/emitCurrentState.js';
import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding'

let remotePlayerSprites = {};
var self;
export default class ZombieGameState extends TiledState {
  constructor(game) {
    super(game);

    //set constants for game
    this.RUNNING_SPEED = 100;
    self = this;
  }

  init (levelData) {
    //Call super init to load in data;
    super.init.call(this, levelData);

    //set constants for game

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
      //PATHFINDING create
      //Create game set up through tiled state by calling super
      super.create.call(this);

      //Create worldGrid and tile dimensions for pathfinding
      let worldGrid = this.createWorldGrid();
      this.tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
      this.pathfinding = this.game.plugins.add(Pathfinding, worldGrid, [-1], this.tileDimensions);

      //Create Players and Temp Objects
      let playerPrefab = this.createPrefab('player',
          {
              type: 'player',
              properties: {
                  group: 'player',
                  initial: 18,
                  texture: 'playerSpriteSheet'
              },
          }, {x: 225, y: 225});

      let enemyPrefab = this.createPrefab('zombie',
        {
            type: 'enemies',
            properties: {
              group: 'enemies',
              initial: 9,
              texture: 'zombieSpriteSheet'
            }
        }, {x: 200, y: 200});

      let crosshairPrefab = this.createPrefab('crosshair',
        {
          type: 'player',
          properties: {
            group: 'cursor',
            initial: 0,
            texture: 'crosshairSpriteSheet'
          },
        }, {x: 0, y: 0});

      let gunPreFab = this.createPrefab('gun', {
        type: 'guns',
        properties: {
          group: 'guns',
          initial: 0,
          texture: 'gunSpriteSheet'
        }
      }, {x: 225, y: 225});
      //END PATHFINDING CREATE



      //create game set up
      console.log('Local state right before load level: ', store.getState() )
      this.loadLevel();
      //set interval to emit currentPlayer to server
      //if we have a current player
      if (this.currentPlayerSprite){
        const emitInterval = emitCurrentState(socket);
      }

      //Charlie/Skinner Tests
      //Add test prefabs into the game
      this.currentPlayer = playerPrefab;
      this.gun = gunPreFab;
      this.pointer = crosshairPrefab;
      this.currentEnemy = enemyPrefab;

      this.currentEnemy.acquireTarget = throttle(this.currentEnemy.acquireTarget, 200);

      this.game.add.existing(this.currentPlayer);
      this.game.add.existing(this.currentEnemy);
      this.game.add.existing(this.pointer);
      this.game.add.existing(this.gun);

      //on click lock the users mouse for input
      this.game.input.onDown.add(this.lockPointer, this);

      //Set camera to follow, then make world big to allow camera to pan off
      //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
      this.camera.follow(this.currentPlayer);
      this.game.world.setBounds(-250, -250, 2500, 2500);

      ////////
      this.currentEnemy.animations.play('dead');
  }

  update () {
      //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision);
	    this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision2);
	    this.game.physics.arcade.collide(this.currentPlayer, this.layers.waterCollision);
	    this.game.physics.arcade.collide(this.currentPlayer, this.layers.wallCollision);
	    this.handleInput();

	    this.currentEnemy.acquireTarget();

      this.tweenGun();
      this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision2);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.waterCollision);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.wallCollision);

      this.updateRemotePlayers();
      if (this.currentPlayerSprite) {
        this.handleInput();
        this.dispatchCurrentPlayer();
      }
      //every 32ms send package to server with position
}

render() {
    this.game.debug.spriteInfo(this.gun, 32, 32);
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

  ///////////////////////
  //Non Phaser Methods

/*TODO: implement handle input better
  handleInput() {
      if (this.currentPlayer) {
          let pointerX = this.game.input.activePointer.worldX;
          let pointerY = this.game.input.activePointer.worldY;
          let playerX = this.currentPlayer.x;
          let playerY = this.currentPlayer.y
          this.currentPlayer.body.velocity.x = 0;
          this.currentPlayer.body.velocity.y = 0;
          if (this.game.cursors.left.isDown) {
              this.currentPlayer.animations.play('right');
              this.currentPlayer.scale.setTo(-1, 1);
              this.currentPlayer.body.velocity.x = -this.RUNNING_SPEED;

              switch (this.currentPlayer.body.sprite._frame.name) {
                  case 'lookingRightRightLegUp.png':
                      this.currentPlayer.body.velocity.y -= 80;
                      break;
                  case 'RightComingDown1.png':
                      this.currentPlayer.body.velocity.y += 80;
                      break;
                  case 'movingRight4.png':
                      this.currentPlayer.body.velocity.y += 50;
                      break;
                  case 'playerSprites_266 copy.png':
                      this.currentPlayer.body.velocity.y -= 50
              }

          }

          if (this.game.cursors.right.isDown) {
              this.currentPlayer.scale.setTo(1, 1);
              this.currentPlayer.animations.play('right');
              this.currentPlayer.body.velocity.x = this.RUNNING_SPEED;

              switch (this.currentPlayer.body.sprite._frame.name) {
                  case 'lookingRightRightLegUp.png':
                      this.currentPlayer.body.velocity.y -= 80;
                      break;
                  case 'RightComingDown1.png':
                      this.currentPlayer.body.velocity.y += 80;
                      break;
                  case 'movingRight4.png':
                      this.currentPlayer.body.velocity.y += 50;
                      break;
                  case 'playerSprites_266 copy.png':
                      this.currentPlayer.body.velocity.y -= 50
              }
          }

          if (this.game.cursors.up.isDown) {
              this.currentPlayer.body.velocity.y = -this.RUNNING_SPEED;
              this.currentPlayer.animations.play('up');
          }

          if (this.game.cursors.down.isDown) {
              this.currentPlayer.body.velocity.y = this.RUNNING_SPEED;
              this.currentPlayer.animations.play('down');
          }

          if (this.currentPlayer.body.velocity.x === 0 && this.currentPlayer.body.velocity.y === 0) {
              this.currentPlayer.animations.stop();
              //console.log("pointer on rest", this.game.input.activePointer.worldX, this.game.input.activePointer.worldY);
              //console.log("player position on rest", this.currentPlayer.x, this.currentPlayer.y);

              this.currentPlayer.scale.setTo(1, 1);
              if((pointerY > playerY) && (pointerX < playerX)) {
                  this.currentPlayer.frame = 17;
                  this.gun.scale.setTo(1, -1);
              }
              if((pointerY > playerY) && (pointerX > playerX)) {
                  this.currentPlayer.frame = 18;
                  this.gun.scale.setTo(1, 1);
              }
              if((pointerY < playerY) && (pointerX > playerX)) {
                  this.currentPlayer.frame = 14;
                  this.gun.scale.setTo(1, 1);
              }
              if((pointerY < playerY) && (pointerX < playerX)) {
                  this.currentPlayer.frame = 14;
                  this.gun.scale.setTo(1, -1);
              }
          }
      }
  }*/

  lockPointer () {
    document.body.style.cursor = 'none';
    this.game.canvas.addEventListener('mousemove', () => {
      this.pointer.x = this.game.input.activePointer.worldX;
      this.pointer.y = this.game.input.activePointer.worldY;
    });

  createRemotePlayerSprite(playerState){
    if (playerState.socketId !== socket.id){
      console.log('creating remote player with this playerState: ', playerState);
      let remoteSprite = self.game.add.sprite(playerState.x, playerState.y, 'blueGunGuy');
      remotePlayerSprites[playerState.socketId] = remoteSprite;
    }
  }

  tweenGun(){
        //gun follow does not work as a child of the player sprite.. had to tween gun to players x, y position
        this.add.tween(this.gun).to( { x: this.currentPlayer.x, y: this.currentPlayer.y}, 10, Phaser.Easing.Linear.None, true);
  }
}
