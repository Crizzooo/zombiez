const store = require('../store.js');
const R = require('ramda');

const resetPlayers = require('../reducers/players.js').resetPlayers;
const addPlayer = require('../reducers/players.js').addPlayer;
const removePlayer = require('../reducers/players.js').removePlayer;
const gamePlaying = require('../reducers/engine.js').gamePlaying;
const resetEngine = require('../reducers/engine.js').resetEngine;
const resetLobby = require('../reducers/lobby.js').resetLobby;

const playerReducer = require('../reducers/players.js');
console.log('player reducer!', playerReducer);

const SERVER_UPDATE_RATE = 1000 / 30;


let playerPositions = [
  {x: 210, y: 210},
  {x: 230, y: 230},
  {x: 250, y: 250},
  {x: 270, y: 270}
]

let io;
let broadcastInterval;
const startGame = (ioFromSocketsFile) => {

  //reset all reducers related to game
  console.log(typeof resetPlayers);
  console.log(resetPlayers);
  console.log('what is store', store);
  console.log(typeof store);
  store.dispatch(resetPlayers());
  store.dispatch(gamePlaying(true));
  io = ioFromSocketsFile;
  let state = store.getState();
  //get lobbyers
  let lobbyers = state.lobby.lobbyers;
    //convert lobbyers to players with spawn positions
    //TODO: Convert Lobbyers should choose a sprite key
  let players = convertLobbyers(lobbyers);
    //put on backend state
  players.forEach( (player) => {
    store.dispatch(addPlayer(player));
  })

  state = store.getState();
  //tell clients to turn on game
  io.emit('gamePlayingUpdate', true);
  io.emit('startGame', state.players.playerStates);

  //broadcast interval gets set to global var, clearInterval in endGame
  broadcastGameState(io);
}

const endGame = () => {

  //reset players
  console.log(typeof resetPlayers);
  console.log('rset players', resetPlayers);
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

    if (Object.keys(state.players.playerStates).length <= 0) {
      console.log('we should end game ');
      endGame();
    }
    //TODO: check if win condition is hit and endgame
    io.emit('serverUpdate', state);
  }, SERVER_UPDATE_RATE);
}

const convertLobbyers = (lobbyers) => {
  return lobbyers.map( (lobbyObj, index) => {
    return {
      x: playerPositions[index].x,
      y: playerPositions[index].y,
      health: 100,
      animationDirection: 'still',
      socketId: lobbyObj.socketId
    };
  });
};

const checkPlayerStates = (playerObjVal, playerObjKey) => {
  if (!playerObjVal.socketId) {

  }
}
module.exports = { startGame, endGame };
