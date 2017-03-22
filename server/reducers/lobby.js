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
  lobbyers: [],
  messages: []
};

const lobby = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  switch (action.type) {

    case NEW_MESSAGE:
        //TODO: we probably arent doing anything with this. Server should just be emitting the message to local clients
        newState.messages = [ ...state.messages, {user: action.user, message: action.msg}];
        break;

    case PLAYER_JOIN_LOBBY:
        newState.lobbyers = [...state.lobbyers, action.lobbyer];
        break;

    case LOBBYER_LEAVE_LOBBY:
        newState.lobbyers = newState.lobbyers.filter(lobbyer => lobbyer.socketId !== action.lobbyerId);
        break;

    case RESET_LOBBY:
        console.log('resetting server lobby');
        newState.lobbyers = [];
        break;

    default:
        return state;
  }
  return newState;
}

module.exports = {lobby, receiveJoinLobby, receiveLobbyerLeave, resetLobby}
