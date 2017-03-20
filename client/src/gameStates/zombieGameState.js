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

        //on click lock the users mouse
        this.game.input.onDown.add(this.lockPointer, this);
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

        let crosshairPrefab = this.createPrefab('player',
            {
                type: 'player',
                properties: {
                    group: 'player',
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


        this.currentPlayer = playerPrefab;

        this.pointer = crosshairPrefab;

        this.gun = gunPreFab;
        this.gun.anchor.setTo(0.5);

        // this.currentPlayer.addChild(this.gun);???
        this.gun.pivot.x = -10;
        this.game.add.existing(this.currentPlayer);
        this.game.add.existing(this.gun);

        this.game.add.existing(this.pointer);

        //Set camera to follow, then make world big to allow camera to pan off
        this.camera.follow(this.currentPlayer);
        this.game.world.setBounds(-250, -250, 800, 2000);

        this.currentPlayer.debug = true;
    }

    update() {
        this.tweenGun();
        this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);
        this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision);
        this.game.physics.arcade.collide(this.currentPlayer, this.layers.backgroundDecCollision2);
        this.game.physics.arcade.collide(this.currentPlayer, this.layers.waterCollision);
        this.game.physics.arcade.collide(this.currentPlayer, this.layers.wallCollision);
        this.handleInput();
    }

    render() {
        this.game.debug.spriteInfo(this.gun, 32, 32);
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
    }

    lockPointer () {
        document.body.style.cursor = 'none';
        this.game.canvas.addEventListener('mousemove', () => {
            this.pointer.x = this.game.input.activePointer.worldX;
            this.pointer.y = this.game.input.activePointer.worldY;
        });
    }

    tweenGun(){
        //gun follow does not work as a child of the player sprite.. had to tween gun to players x, y position
        this.add.tween(this.gun).to( { x: this.currentPlayer.x, y: this.currentPlayer.y}, 10, Phaser.Easing.Linear.None, true);
    }
}