const {combineReducers} = require('redux');
const players = require('./players.js').playerReducers;
const engine = require("./engine.js").engineReducers;
const lobby = require('./lobby.js').lobby;


//need players, engine
const mainReducer = combineReducers({
  lobby
})
console.log(typeof mainReducer);

module.exports = mainReducer;
