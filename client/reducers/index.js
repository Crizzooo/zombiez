import {combineReducers} from 'redux';
import players from './players.js';
import lobby from './lobby-reducer.js';
import enemies from './enemies.js';
import game from './game.js';

export default combineReducers({
  players,
  lobby,
  enemies,
  game
});
