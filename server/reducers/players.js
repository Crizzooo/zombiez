const REMOVE_PLAYER = 'REMOVE_PLAYER';
const RECEIVE_CLIENT_DATA = 'RECEIVE_CLIENT_DATA';
const RESET_PLAYERS = 'RESET_PLAYERS';

const removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
})

const receiveClientData = (id, data) => ({
  type: RECEIVE_CLIENT_DATA,
  id,
  data
})

const resetPlayers = () => ({
  type: RESET_PLAYERS
});

const initialState = () => ({
  players: []
});

const playerReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  switch (action.type) {
    case REMOVE_PLAYER:

      break;

    case RECEIVE_CLIENT_DATA:

      break;

    case RESET_PLAYERS:

      break;

    default:
      return state;
  }
  return newState;
}

module.exports = { playerReducers, removePlayer, receiveClientData, resetPlayers };
