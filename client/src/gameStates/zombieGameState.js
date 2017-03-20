const R = require('ramda');
const throttle = require('lodash.throttle');

import TiledState from './tiledState';
import Pathfinding from '../plugins/Pathfinding'

let self;
ZG.playerSprites = [];

export default class ZombieGameState extends TiledState {
    constructor(game) {
      super(game);

    }

    init(levelData) {
      //set constants for game
      this.RUNNING_SPEED = 100;
      self = this;

      //Call super init to load in data;
      super.init.call(this, levelData);

      window.socket.on('serverUpdate', this.updateClients);
    }


    preload() {
      //TODO: fix spegetti
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

      //Create worldGrid and tile dimensions for pathfinding
      let worldGrid = this.createWorldGrid();
      this.tileDimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
      this.pathfinding = this.game.plugins.add(Pathfinding, worldGrid, [-1], this.tileDimensions);


      //on click lock the users mouse
      this.game.input.onDown.add(this.lockPointer, this);
      //listen to mouse move after locked
      //Create Players
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

      let otherPlayerPrefab = this.createPrefab('cursor',
          {
              type: 'player',
              properties: {
                  group: 'cursor',
                  initial: 18,
                  texture: 'playerSpriteSheet'
              },
          }, {x: 0, y: 0});


      //Add test prefabs into the game
      this.currentPlayer = playerPrefab;
      this.pointer = otherPlayerPrefab;
      this.currentEnemy = enemyPrefab;

      this.currentEnemy.acquireTarget = throttle(this.currentEnemy.acquireTarget, 200);

      this.game.add.existing(this.currentPlayer);
      this.game.add.existing(this.currentEnemy);
      this.game.add.existing(this.pointer);

      //Set camera to follow, then make world big to allow camera to pan off
      //this.camera.view = new Phaser.Rectangle(0, 0, this.currentPlayer.position.x, this.currentPlayer.position.y);
      this.camera.follow(this.currentPlayer);
      this.game.world.setBounds(-250, -250, 2500, 2500);

      this.currentPlayer.debug = true;

      ////////
      this.currentEnemy.animations.play('dead');
    }

    test(currentPlayer, currentLayer) {
      console.log('inside callback', currentPlayer)
      console.log('inside callback', currentLayer)
    }

    update() {
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision2);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.waterCollision);
      this.game.physics.arcade.collide(this.currentPlayer, this.layers.wallCollision);
      this.handleInput();

	    this.currentEnemy.acquireTarget();

    }

    render() {
        this.game.debug.spriteInfo(this.currentPlayer, 32, 32);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Non Phaser Methods

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
                if((pointerY > playerY) && (pointerX < playerX)) this.currentPlayer.frame = 17;
                if((pointerY > playerY) && (pointerX > playerX)) this.currentPlayer.frame = 18;
                if((pointerY < playerY) && (pointerX > playerX)) this.currentPlayer.frame = 14;
                if((pointerY < playerY) && (pointerX < playerX)) this.currentPlayer.frame = 14;
            }
        }
    }

    lockPointer () {
      document.body.style.cursor = 'none';
      this.game.canvas.addEventListener('mousemove', () => {
        this.pointer.x = this.game.input.activePointer.worldX;
        this.pointer.y = this.game.input.activePointer.worldY;
      });
    }
}