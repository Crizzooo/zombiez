const R = require('ramda');
const throttle = require('lodash.throttle');

const throttledServerUpdate = throttle(sendPlayerToServer, 16);
window.socket.on('serverUpdate', updateClients);

ZG.playerSprites = [];
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

  //every 20ms send package to server with position
  throttledServerUpdate();
}


const loadLevel = () => {
  // ZG.gameBackground = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'snowLandscape');
  // ZG.gameBackground.scale.setTo(0.9, 0.9);
  // ZG.gameBackground.anchor.setTo(0.5);


  //resize the world to fit the layer
  ZG.game.world.resize(570, 550);


  //for each player in lobby, create a player sprite
  ZG.players.map( (playerObj, index) => {
    console.log('player created for: ', playerObj);
    let spriteKey = index % 2 === 0 ? 'blueGunGuy' : 'greenGunGuy';
    let playerSprite = ZG.game.add.sprite(ZG.game.world.centerX + 15*index, ZG.game.world.centerY + 15*index, spriteKey);

    ZG.game.physics.arcade.enable(playerSprite);
    //determine if client is currently a player, and assign his sprite to currentPlayer object
    console.log('My socket id: ', socket.id);
    if (socket.id === playerObj.socketId) {
      ZG.currentPlayer = playerSprite;
      console.log('current player assigned:', playerSprite);
    }
    ZG.playerSprites.push({socketId: playerObj.socketId, sprite: playerSprite});
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
  // console.log('CP: 'ZG.currentPlayer)
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
var date;
const emitPing = function () {
  console.log('emit ping called');
  window.socket.emit('pingTest');
  date = new Date();
}

function sendPlayerToServer(){
  let x = ZG.currentPlayer.body.x;
  let y = ZG.currentPlayer.body.y;
  let gameTime = new Date() - ZG.startDate;
  let playerId = socket.id;
  console.log('Are we sending a socket:', socket);

  let clientState = {
    x,
    y,
    gameTime,
    playerId
  }

  socket.emit('clientUpdate', clientState);
}

function updateClients(serverState) {
  R.forEachObjIndexed(updatePlayer, serverState);
  // console.log('state from server:', serverState);
}

function updatePlayer(playerState) {

  console.log('should be id', playerState)

  console.log('filtering: ', ZG.playerSprites);
  console.log('looking for id:', playerState.id);
  let playerToMove = ZG.playerSprites.filter((playerSprite) => {
    console.log('examining sprite: ', playerSprite)
    console.log('returning: ', playerSprite.socketId == playerState.id);
    return playerSprite.socketId == playerState.id;
  })[0];

  console.log('Player To Move: ', playerToMove);

  // let playerToMove = R.find(R.propEq('id', playerState.id))(ZG.playerSprites);

  if (playerToMove && playerToMove.socketId != window.socket.id){
    playerToMove.sprite.x = playerState.x;
    playerToMove.sprite.y = playerState.y;
  }
}

function findPlayer(id) {

}
