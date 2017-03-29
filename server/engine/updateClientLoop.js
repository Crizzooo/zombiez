const store = require('../store.js');
const R = require('ramda');

const resetPlayers = require('../reducers/players.js').resetPlayers;
const addPlayer = require('../reducers/players.js').addPlayer;
const removePlayer = require('../reducers/players.js').removePlayer;
const gamePlaying = require('../reducers/engine.js').gamePlaying;
const resetEngine = require('../reducers/engine.js').resetEngine;
const resetLobby = require('../reducers/lobby.js').resetLobby;
const playerReducer = require('../reducers/players.js');
 const PLAYER_HEALTH = require('../../client/src/engine/gameConstants.js').PLAYER_HEALTH;
const {addPlayerToZombieSprites, resetZombies} = require('../reducers/zombies.js');


const SERVER_UPDATE_RATE = 1000 / 30;


let io;
let broadcastInterval;


//TODO: Implement actual spawn positions from map
let playerPositions = [
  {x: 160, y: 128},
  {x: 480, y: 544},
  {x: 608, y: 1088},
  {x: 224, y: 1440},
  {x: 1376, y: 1408},
  {x: 1120, y: 1088},
  {x: 1088, y: 576},
  {x: 1376, y: 160}
]
//TODO: Implement correct sprite keys for ZOMBIE GUN GAME
let playerSpriteKeys = [ 'playerSpriteSheet', 'playerSpriteSheet'];

//This function is used to take the server lobby state, and initialize player objects
const convertLobbyers = (lobbyers) => {
  return lobbyers.map( (lobbyObj, index) => {
    let spriteKey = playerSpriteKeys[index % 2];
    let zeroOrOne = Math.round(Math.random());
    return {
      x: playerPositions[(index*2) + zeroOrOne].x,
      y: playerPositions[(index*2) + zeroOrOne].y,
      animationDirection: 'still',
      spriteKey,
      socketId: lobbyObj.socketId,
      name: lobbyObj.name,
      health: PLAYER_HEALTH
    };
  });
};

const startGame = (ioFromSocketsFile) => {

  //reset all reducers related to game
  store.dispatch(resetPlayers());
  store.dispatch(gamePlaying(true));
  io = ioFromSocketsFile;
  let state = store.getState();
  //get lobbyers
  console.log('BEFORE SERVER STARTS NEW GAME - OLD STATE: ', state);
  let lobbyers = state.lobby.lobbyers;
  console.log('starting new game with these lobbyers: ', lobbyers);
    //convert lobbyers to players with spawn positions
    //TODO: Convert Lobbyers should choose a sprite key
  let players = convertLobbyers(lobbyers);
  console.log('here are the players that were converted: ', players);
    //put on backend state
  players.forEach( (player) => {
    store.dispatch(addPlayer(player));
    //initialize object to hold this players zombies in zombie state
    store.dispatch(addPlayerToZombieSprites(player.socketId));
  })

  state = store.getState();
  console.log('server state right before starting game: ', state);
  console.dir(state, { depth: 8});
  //tell clients to turn on game
  io.emit('gamePlayingUpdate', true);
  io.emit('startGame', state.players.playerStates);

  //broadcast interval gets set to global var, clearInterval in endGame
  broadcastGameState(io);
}

const endGame = () => {

  //reset players
  store.dispatch(resetPlayers());
  //reset game
  store.dispatch(resetEngine());
  //reset lobby
  store.dispatch(resetLobby());
  //reset zombies
  store.dispatch(resetZombies());

  //tell players they can join lobby and play game again
  io.emit('gamePlayingUpdate', false);

  //end the broadcastInterval
  clearInterval(broadcastInterval);

  //reset client reducers & remove canvas from DOM
  io.emit('resetGame');
}

const broadcastGameState = (io) => {
  broadcastInterval = setInterval(() => {
    let state = store.getState();
    // console.log('dispatching state: ', state);

    //TODO: check if win condition is hit and endgame
    if (state.lobby.lobbyers.length <= 0) {
      console.log('Not enough players - ending game');
      endGame();
    } else {
      io.emit('serverUpdate', state);
    }
  }, SERVER_UPDATE_RATE);
}

module.exports = { startGame, endGame };
