import {combineReducers} from 'redux';
import chatAppReducer from './chatApp-reducer';
import playersReducer from './players-reducer';
import game from './gameState-reducer';

import lobby from './lobby-reducer.js';

export default combineReducers({
  chatApp: chatAppReducer,
  game,
  players: playersReducer,
  lobby
});

//sad
