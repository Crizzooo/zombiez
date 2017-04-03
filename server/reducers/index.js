const {combineReducers} = require('redux');
const players = require('./players.js').playerReducers;
const game = require('./engine.js').engineReducers;
const lobbies = require('./lobby.js').lobby;
const zombies = require('./zombies.js').zombieReducer;
const logs = require('./logs.js').logsReducer;



const mainReducer = combineReducers({
  lobbies,
  players,
  game,
  zombies,
  logs
});
console.log(typeof mainReducer);

module.exports = mainReducer;
