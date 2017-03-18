const store = require('../store.js');

const resetPlayers = require('../reducers/players.js').resetPlayers;


const SERVER_UPDATE_RATE = 1000 / 30;

let broadcastInterval;
const startGame = (io) => {

  //reset all reducers related to game
  store.dispatch(resetPlayers());

  //tell clients to turn on game
  io.emit('turnOnGameComponent');
  io.emit('startGame');

  broadcastGameState(io);
}

const endGame = () => {
  //end the broadcastInterval
}

const broadcastGameState = (io) => {
  broadcastInterval = setInterval(() => {
    let state = store.getState();
    io.emit('serverUpdate', state);
    //TODO: check if win condition is hit and endgame
  }, SERVER_UPDATE_RATE);
}


module.exports = { startGame };
