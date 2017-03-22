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

    case ADD_PLAYER: {
      console.log("Server is adding a player from: ", action.playerState);
      let newPlayerStates = Object.assign({}, state.playerStates);
      newPlayerStates[action.playerState.socketId] = action.playerState;
      newState.playerStates = newPlayerStates;
      break;
    }

    case UPDATE_PLAYER: {
      console.log('Update received this action: ', action);
      let newPlayerStates = Object.assign({}, state.playerStates);
      newPlayerStates[action.playerToUpdate.socketId] = action.playerToUpdate;
      if (!action.playerToUpdate.socketId){
        return state;
      }
      newState.playerStates = newPlayerStates;
      break;
    }

    case RESET_PLAYERS: {
      newState.playerStates = {};
      break;
    }

    case REMOVE_PLAYER: {
      let newPlayerStates = Object.assign({}, state.playerStates);
      console.log('server received remove player: ', action.id);
      if (newPlayerStates['undefined']){
        delete newPlayerStates['undefined'];
      }
      if (newPlayerStates[action.id]){
        delete newPlayerStates[action.id];
      }
      newState.playerStates = newPlayerStates;
      break;
    }

    default:
      return state;
  }
  return newState;
}

module.exports = { playerReducers, removePlayer, receiveClientData, resetPlayers, addPlayer, updatePlayer };
