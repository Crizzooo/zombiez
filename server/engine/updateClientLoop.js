const store = require('../store.js');
const R = require('ramda');

const resetPlayers = require('../reducers/players.js').resetPlayers;
const addPlayer = require('../reducers/players.js').addPlayer;
const removePlayer = require('../reducers/players.js').removePlayer;
const gamePlaying = require('../reducers/engine.js').gamePlaying;
const resetEngine = require('../reducers/engine.js').resetEngine;
const resetLobby = require('../reducers/lobby.js').resetLobby;
const playerReducer = require('../reducers/players.js');


const SERVER_UPDATE_RATE = 1000 / 30;


let io;
let broadcastInterval;


//TODO: Implement actual spawn positions from map
let playerPositions = [
  {x: 210, y: 210},
  {x: 230, y: 230},
  {x: 250, y: 250},
  {x: 270, y: 270}
]
//TODO: Implement correct sprite keys for ZOMBIE GUN GAME
let playerSpriteKeys = [ 'playerSpriteSheet', 'playerSpriteSheet'];

//This function is used to take the server lobby state, and initialize player objects
const convertLobbyers = (lobbyers) => {
  return lobbyers.map( (lobbyObj, index) => {
    let spriteKey = playerSpriteKeys[index % 2];
    return {
      x: playerPositions[index].x,
      y: playerPositions[index].y,
      health: 100,
      animationDirection: 'still',
      spriteKey,
      socketId: lobbyObj.socketId
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
    console.log('adding player to player store: ', player);
    store.dispatch(addPlayer(player));
  })

  state = store.getState();
  console.log('server state right before starting game: ', state);
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

  //tell players they can join lobby and play game again
  io.emit('gamePlayingUpdate', false);

  //end the broadcastInterval
  clearInterval(broadcastInterval);

  //reset client reducers
  io.emit('resetGame');
}

const broadcastGameState = (io) => {
  broadcastInterval = setInterval(() => {
    let state = store.getState();

    //TODO: check if win condition is hit and endgame
    if (state.lobby.lobbyers.length <= 0) {
      console.log('we should end game ');
      endGame();
    } else {
      io.emit('serverUpdate', state);
    }
  }, SERVER_UPDATE_RATE);
}

const checkPlayerStates = (playerObjVal, playerObjKey) => {
  if (!playerObjVal.socketId) {

  }
}
module.exports = { startGame, endGame };