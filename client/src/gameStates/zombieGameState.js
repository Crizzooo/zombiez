const R = require('ramda');
const throttle = require('lodash.throttle');

import TiledState from './tiledState';

let self;
ZG.playerSprites = [];

export default class ZombieGameState extends TiledState {
  constructor(game) {
    super(game);
  }

  init(levelData) {
    //set constants for game
    this.RUNNING_SPEED = 80;
    self = this;

    //Call super init to load in data;
    super.init.call(this, levelData)

    //Make pixels crisp
    //this.stage.smoothed = false;

    window.socket.on('serverUpdate', this.updateClients);

    //TODO: determine if we need these or the ones in boot
    //cursor keys
    //Control Mechanics
    //this.cursors = this.input.keyboard.createCursorKeys();
    //this.cursors.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //this.sendToServer = throttle(this.sendPlayerToServer, 16);
  }


  preload() {
    //TODO: fix spegetti
    //let playerSprite = ZG.game.add.sprite(this.game, ZG.game.world.centerX + 15 * index, ZG.game.world.centerY + 15 * index, spriteKey, 18);

    // //for each player in lobby, create a player sprite
    // ZG.playerSprites = ZG.players.map((playerObj, index) => {
    //   //determine if client is currently a player, and assign his sprite to currentPlayer object
    //   if (socket.id === playerObj.socketId) {
    //     this.currentPlayer = playerPrefab;
    //   }
    // });
  }

  create() {
    //Create game set up through tiled state by calling super
    super.create.call(this);

    let playerPrefab = this.createPrefab('player',
      {
        type: 'player',
        properties: {
          group: 'player',
          initial: 18,
          texture: 'playerSpriteSheet'
        },
      }, {x: 225, y: 225});

    this.currentPlayer = playerPrefab;
  }

  update() {
    this.handleInput();

    //every 16ms send package to server with position
    //this.sendToServer();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Non Phaser Methods

  handleInput() {
    if (this.currentPlayer) {
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
        this.currentPlayer.frame = 18;
      }
    }
  }

  // handleInput() {
  //   if (this.currentPlayer) {
  //     this.currentPlayer.body.velocity.x = 0;
  //     this.currentPlayer.body.velocity.y = 0;
  //     // console.log("VELOCITY", this.currentPlayer.body.velocity.x, this.currentPlayer.body.velocity.y);
  //     if (this.game.cursors.left.isDown) {
  //       // if(playerStatus === '')
  //       this.currentPlayer.animations.play('right');
  //       this.currentPlayer.scale.setTo(-1, 1);
  //       this.currentPlayer.body.velocity.x = -this.RUNNING_SPEED;
  //
  //       switch (this.currentPlayer.body.sprite._frame.name) {
  //         case 'lookingRightRightLegUp.png':
  //           this.currentPlayer.body.velocity.y -= 80;
  //           break;
  //         case 'RightComingDown1.png':
  //           this.currentPlayer.body.velocity.y += 80;
  //           break;
  //         case 'movingRight4.png':
  //           this.currentPlayer.body.velocity.y += 50;
  //           break;
  //         case 'playerSprites_266 copy.png':
  //           this.currentPlayer.body.velocity.y -= 50
  //       }
  //
  //     }
  //
  //     if (this.game.cursors.right.isDown) {
  //       this.currentPlayer.scale.setTo(1, 1);
  //       this.currentPlayer.animations.play('right');
  //       this.currentPlayer.body.velocity.x = this.RUNNING_SPEED;
  //
  //       switch (this.currentPlayer.body.sprite._frame.name) {
  //         case 'lookingRightRightLegUp.png':
  //           this.currentPlayer.body.velocity.y -= 80;
  //           break;
  //         case 'RightComingDown1.png':
  //           this.currentPlayer.body.velocity.y += 80;
  //           break;
  //         case 'movingRight4.png':
  //           this.currentPlayer.body.velocity.y += 50;
  //           break;
  //         case 'playerSprites_266 copy.png':
  //           this.currentPlayer.body.velocity.y -= 50
  //       }
  //
  //       if (this.game.cursors.up.isDown) {
  //         this.currentPlayer.body.velocity.y = -this.RUNNING_SPEED;
  //         this.currentPlayer.animations.play('up');
  //       }
  //
  //       if (this.game.cursors.down.isDown) {
  //         this.currentPlayer.body.velocity.y = this.RUNNING_SPEED;
  //         this.currentPlayer.animations.play('down');
  //       }
  //
  //       if (this.currentPlayer.body.velocity.x === 0 && this.currentPlayer.body.velocity.y === 0) {
  //         this.currentPlayer.animations.stop();
  //         this.currentPlayer.frame = 18;
  //       }
  //     }
  //   }
  // }

  // sendPlayerToServer(){
  //   let x = ZG.currentPlayer.body.x;
  //   let y = ZG.currentPlayer.body.y;
  //   let gameTime = new Date() - ZG.startDate;
  //   let playerId = socket.id;
  //   console.log('Are we sending a socket:', socket);
  //
  //   let clientState = {
  //     x,
  //     y,
  //     gameTime,
  //     playerId
  //   }
  //   socket.emit('clientUpdate', clientState);
  // }
  //
  //
  // updateClients(serverState) {
  //   R.forEachObjIndexed(self.updatePlayer, serverState);
  //   // console.log('state from server:', serverState);
  // }
  //
  // updatePlayer(playerState) {
  //   // console.log('should be id', playerState)
  //
  //   // console.log('filtering: ', ZG.playerSprites);
  //   // console.log('looking for id:', playerState.id);
  //   let playerToMove = ZG.playerSprites.filter((playerSprite) => {
  //     // console.log('examining sprite: ', playerSprite)
  //     // console.log('returning: ', playerSprite.socketId == playerState.id);
  //     return playerSprite.socketId == playerState.id;
  //   })[0];
  //
  //   // console.log('Player To Move: ', playerToMove);
  //
  //   // let playerToMove = R.find(R.propEq('id', playerState.id))(ZG.playerSprites);
  //
  //   if (playerToMove && playerToMove.socketId != window.socket.id){
  //     playerToMove.sprite.x = playerState.x;
  //     playerToMove.sprite.y = playerState.y;
  //   }
  // }

}