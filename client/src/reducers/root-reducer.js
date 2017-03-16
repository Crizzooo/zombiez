import {combineReducers} from 'redux';
import chatAppReducer from './chatApp-reducer';
import playersReducer from './players-reducer';
import gameStateReducer from './gameState-reducer';

export default combineReducers({
  chatApp: chatAppReducer,
  players: playersReducer,
  gameState: gameStateReducer
});
