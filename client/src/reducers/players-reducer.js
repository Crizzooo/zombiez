import axios from 'axios';
import R from 'ramda';

/* Action Types */
// const ADD_PLAYER = 'ADD_PLAYER';
const LOAD_PLAYERS = 'LOAD_PLAYERS';
const SET_GAME_PLAYING_BOOL = 'SET_GAME_PLAYING_BOOL';
const UPDATE_PLAYER_SCORE = 'UPDATE_PLAYER_SCORE';
const UPDATE_PLAYERS = 'UPDATE_PLAYERS';
const UPDATE_CURRENT_PLAYER = 'UPDATE_CURRENT_PLAYER';
const PLAYER_LEAVE_GAME = 'PLAYER_LEAVE_GAME';

/* Action Creators */
export const loadMessage = message => ({ type: CHANGE_MESSAGE, message });
// export const addPlayer = player => ({type: ADD_PLAYER, player});
export const loadPlayers = playersFromServer => ({type: LOAD_PLAYERS, players: playersFromServer})
export const changeGamePlaying = gameStatus => ({type: SET_GAME_PLAYING_BOOL, gameStatus});
export const changePlayerScore = (socketId, newScore) => ({type: UPDATE_PLAYER_SCORE, id: socketId, newScore: newScore})
export const updatePlayers = serverPlayersState => ({
  type: UPDATE_PLAYERS,
  players: serverPlayersState
})
export const updateCurrentPlayer = currentPlayerState => ({
  type: UPDATE_CURRENT_PLAYER,
  currentPlayerState
});
export const playerLeaveGame = playerSocketId => ({
  type: PLAYER_LEAVE_GAME,
  id: playerSocketId
});

//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  playerStates: {},
  currentPlayer: {}
};

/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case LOAD_PLAYERS:
      newState.playerStates = action.players;
      break;

    case SET_GAME_PLAYING_BOOL:
      newState.gamePlaying = action.gameStatus;
      break;

    case UPDATE_PLAYERS:
      newState.playerStates = action.players;
      break;

    case UPDATE_CURRENT_PLAYER:
      newState.currentPlayer = action.currentPlayerState;
      break;

    case PLAYER_LEAVE_GAME:
        if (newState.playerStates[action.id]) {
          delete newState.playerStates[action.id]
        }
      break;

    default:
      return state;
  }

  return newState;
};
