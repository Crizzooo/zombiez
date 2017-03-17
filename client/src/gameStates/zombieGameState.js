const R = require('ramda');
const throttle = require('lodash.throttle');


const init = () => {
    //set constants for game
    ZG.RUNNING_SPEED = 110;

    //cursor keys
    //ZG.game.cursors created in boot state file
}

const preload = () => {
    //load assets that are specific for this mini game
}

const create = () => {
    //create game set up
    loadLevel();
}


const update = () => {
    //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB

    handleInput();


}


const loadLevel = () => {
    // ZG.gameBackground = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'snowLandscape');
    // ZG.gameBackground.scale.setTo(0.9, 0.9);
    // ZG.gameBackground.anchor.setTo(0.5);


    //resize the world to fit the layer
    ZG.game.world.resize(570, 550);


    //for each player in lobby, create a player sprite
    ZG.playerSprites = ZG.players.map((playerObj, index) => {
        console.log('player created for: ', playerObj);
        let spriteKey = index % 2 === 0 ? 'playerSpriteSheet' : 'playerSpriteSheet';
        let playerSprite = ZG.game.add.sprite(ZG.game.world.centerX + 15 * index, ZG.game.world.centerY + 15 * index, spriteKey, 18);
        ZG.game.physics.arcade.enable(playerSprite);
        playerSprite.animations.add('right', [24, 8, 5, 20, 12, 13], 10, true);
        playerSprite.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
        playerSprite.animations.add('up', [16, 0, 14, 6, 1], 10, true);
        playerSprite.animations.add('down', [23, 9, 21, 22, 7, 4], 10, true);
        //determine if client is currently a player, and assign his sprite to currentPlayer object
        if (socket.id === playerObj.socketId) {
            ZG.currentPlayer = playerSprite;
        }
    });
};

var ZombieGameState = {
    init,
    preload,
    create,
    update
}
export default ZombieGameState;


function handleInput() {
    if (ZG.currentPlayer) {
        ZG.currentPlayer.body.velocity.x = 0;
        ZG.currentPlayer.body.velocity.y = 0;
        // console.log("VELOCITY", ZG.currentPlayer.body.velocity.x, ZG.currentPlayer.body.velocity.y);
        if (ZG.game.cursors.left.isDown) {
            // if(playerStatus === '')
            ZG.currentPlayer.animations.play('right');
            ZG.currentPlayer.scale.setTo(-1, 1);
            ZG.currentPlayer.body.velocity.x = -ZG.RUNNING_SPEED;

            switch(ZG.currentPlayer.body.sprite._frame.name){
                case 'lookingRightRightLegUp.png':
                    ZG.currentPlayer.body.velocity.y -= 80;
                    break;
                case 'RightComingDown1.png':
                    ZG.currentPlayer.body.velocity.y += 80;
                    break;
                case 'movingRight4.png':
                    ZG.currentPlayer.body.velocity.y += 50;
                    break;
                case 'playerSprites_266 copy.png':
                    ZG.currentPlayer.body.velocity.y -= 50
            }

        }
        if (ZG.game.cursors.right.isDown) {
            ZG.currentPlayer.scale.setTo(1, 1);
            ZG.currentPlayer.animations.play('right');
            ZG.currentPlayer.body.velocity.x = ZG.RUNNING_SPEED;
            switch(ZG.currentPlayer.body.sprite._frame.name){
                case 'lookingRightRightLegUp.png':
                    ZG.currentPlayer.body.velocity.y -= 80;
                    break;
                case 'RightComingDown1.png':
                    ZG.currentPlayer.body.velocity.y += 80;
                    break;
                case 'movingRight4.png':
                    ZG.currentPlayer.body.velocity.y += 50;
                    break;
                case 'playerSprites_266 copy.png':
                    ZG.currentPlayer.body.velocity.y -= 50
            }

        }
        if (ZG.game.cursors.up.isDown) {
            ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
            ZG.currentPlayer.animations.play('up');
        }
        if (ZG.game.cursors.down.isDown) {
            ZG.currentPlayer.body.velocity.y = ZG.RUNNING_SPEED;
            ZG.currentPlayer.animations.play('down');
        }
        if (ZG.currentPlayer.body.velocity.x === 0 && ZG.currentPlayer.body.velocity.y === 0) {
            ZG.currentPlayer.animations.stop();
            ZG.currentPlayer.frame = 18;
            // ZG.currentPlayer.body.sprite._frame.name = 'playerSprites_259.png';
        }
        //else {
        //   // playerStatus = 'still'
        //     ZG.currentPlayer.animations.stop();
        // }
    }
}
