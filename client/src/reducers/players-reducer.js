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
const RESET_PLAYERS = 'RESET_PLAYERS';
const REMOVE_CURRENT_PLAYER = 'REMOVE_CURRENT_PLAYER';

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
export const resetPlayers = () => ({
  type: RESET_PLAYERS
})
export const removeCurrentPlayer = () => ({
  type: REMOVE_CURRENT_PLAYER
})

//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  playerStates: {},
  currentPlayer: {}
};

/* Reducer */
export default (state = initialState, action) => {

  let newState = Object.assign({}, state);

  switch (action.type) {

    case LOAD_PLAYERS:
      //if there is a socket id, make it current player and remove him from playerStates
      if (action.players[socket.id]) {
        newState.currentPlayer = action.players[socket.id];
        delete action.players[socket.id];
      }
      newState.playerStates = action.players;
      break;

    case SET_GAME_PLAYING_BOOL:
      newState.gamePlaying = action.gameStatus;
      break;

    case UPDATE_PLAYERS:
      //filter through players and make sure no undefined
      newState.playerStates = action.players;
      break;

    case UPDATE_CURRENT_PLAYER:
      newState.currentPlayer = action.currentPlayerState;
      break;

    case PLAYER_LEAVE_GAME:
      //TODO: is this immutable?
      let playerStates = Object.assign({}, state.playerStates);
      if (playerStates[action.id]) {
        delete playerStates[action.id];
      }
      newState.playerStates = playerStates;
      break;

    case RESET_PLAYERS:
      newState.playerStates = {};
      newState.currentPlayer = {};
      break;

    case REMOVE_CURRENT_PLAYER:
      newState.currentPlayer = {};
      break;

    default:
      return state;
  }

  return newState;
};
