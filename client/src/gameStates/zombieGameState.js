const R = require('ramda');
const throttle = require('lodash.throttle');


const init = () => {
  //set constants for game
  ZG.RUNNING_SPEED = 180;

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
  ZG.playerSprites = ZG.players.map( (playerObj, index) => {
    console.log('player created for: ', playerObj);
    let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';
    let playerSprite = ZG.game.add.sprite(ZG.game.world.centerX + 15*index, ZG.game.world.centerY + 15*index, spriteKey);
    ZG.game.physics.arcade.enable(playerSprite);
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
  if (ZG.currentPlayer){
    ZG.currentPlayer.body.velocity.x = 0;
    ZG.currentPlayer.body.velocity.y = 0;
    if (ZG.game.cursors.left.isDown){
      ZG.currentPlayer.body.velocity.x = -ZG.RUNNING_SPEED;
    }
    if (ZG.game.cursors.right.isDown){
      ZG.currentPlayer.body.velocity.x = ZG.RUNNING_SPEED;
    }
    if (ZG.game.cursors.up.isDown){
      ZG.currentPlayer.body.velocity.y = -ZG.RUNNING_SPEED;
    }
    if (ZG.game.cursors.down.isDown){
      ZG.currentPlayer.body.velocity.y = ZG.RUNNING_SPEED;
    }
  }
}
