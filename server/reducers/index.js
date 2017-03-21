const {combineReducers} = require('redux');
const players = require('./players.js').playerReducers;
const game = require('./engine.js').engineReducers;
const lobby = require('./lobby.js').lobby;



const mainReducer = combineReducers({
  lobby,
  players,
  game
});
console.log(typeof mainReducer);

module.exports = mainReducer;
