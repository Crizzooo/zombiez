const R = require('ramda');
const NEW_MESSAGE = 'NEW_MESSSAGE';
const PLAYER_JOIN_LOBBY = 'PLAYER_JOIN_LOBBY';
const LOBBYER_LEAVE_LOBBY = 'LOBBYER_LEAVE_LOBBY';
const RESET_LOBBY = 'RESET_LOBBY';


const receiveNewMessage = (msg, user) => ({
  type: NEW_MESSAGE,
  user,
  msg
})

const receiveJoinLobby =  (lobbyObj) => ({
  type: PLAYER_JOIN_LOBBY,
  lobbyer: lobbyObj
})

const receiveLobbyerLeave = (lobbyerId) => ({
  type: LOBBYER_LEAVE_LOBBY,
  lobbyerId
})

const resetLobby = () => ({
  type: RESET_LOBBY
})

const initialState = {
  lobbyers: []
};

const lobby = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  switch (action.type) {

    case NEW_MESSAGE:

        break;

    case PLAYER_JOIN_LOBBY:
        console.log('adding player to lobby on server: ', action.lobbyer);
        newState.lobbyers.push(action.lobbyer);
        break;

    case LOBBYER_LEAVE_LOBBY:
        console.log('removing socketID from lobby: ', action.id);
        console.log('lobby.lobbyers pre remove: ', newState.lobbyers);
        newState.lobbyers = newState.lobbyers.filter(lobbyer => lobbyer.socketId !== action.lobbyerId);
        console.log('lobby.lobbyers post remove: ', newState.lobbyers);
        break;

    case RESET_LOBBY:
        console.log('resetting server lobby');
        newState.lobbyers = [];
        console.log('new server lobby: ', newState);
        break;

    default:
        return state;
  }
  return newState;
}

module.exports = {lobby, receiveJoinLobby, receiveLobbyerLeave, resetLobby}