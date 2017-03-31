import {combineReducers} from 'redux';
import chatAppReducer from './chatApp-reducer';
import playersReducer from './players-reducer';
import game from './gameState-reducer';
import zombies from './zombies-reducer.js';
import logs from './gameLog-reducer.js'

import lobby from './lobby-reducer.js';

export default combineReducers({
  chatApp: chatAppReducer,
  game,
  players: playersReducer,
  lobby,
  zombies,
  logs
});

//sad
