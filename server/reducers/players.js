// Action Types
const ADD_PLAYER = 'ADD_PLAYER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const RECEIVE_CLIENT_DATA = 'RECEIVE_CLIENT_DATA';
const RESET_PLAYERS = 'RESET_PLAYERS';
const UPDATE_PLAYER = 'UPDATE_PLAYER';

//Action Creators
const addPlayer = playerState => ({
  type: ADD_PLAYER,
  playerState
});

const removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
});

const receiveClientData = (id, data) => ({
  type: RECEIVE_CLIENT_DATA,
  id,
  data
});

const updatePlayer = (playerToUpdate) => ({
  type: UPDATE_PLAYER,
  playerToUpdate
});

const resetPlayers = () => ({
  type: RESET_PLAYERS
});

const initialState = { playerStates: {} };

const playerReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  switch (action.type) {
    case ADD_PLAYER:
        //update player state at socket.id
        console.log('ADDING PLAYER TO SERVER STATE: ', action.playerState);
        newState.playerStates[action.playerState.socketId] = action.playerState;
      break;

    case UPDATE_PLAYER:
      newState.playerStates[action.playerToUpdate.socketId] = action.playerToUpdate
      break;

    case RESET_PLAYERS:
      newState.playerStates = {};
      //newState = initialState DOESNT WORK
      break;

    case REMOVE_PLAYER:
      console.log('server received remove player: ', action.id);
      if (newState.playerStates[action.id]){
        console.log('pre remove player in players: ', newState.playerStates);
        delete newState.playerStates[action.id];
        console.log('post remove player in players player: ', newState.playerStates);
      }
      break;

    default:
      return state;
  }
  return newState;
}

module.exports = { playerReducers, removePlayer, receiveClientData, resetPlayers, addPlayer, updatePlayer };
