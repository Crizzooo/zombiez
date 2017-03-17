
const R = require('ramda');
const NEW_MESSAGE = 'NEW_MESSSAGE';
const PLAYER_JOIN_LOBBY = 'PLAYER_JOIN_LOBBY';
const PLAYER_LEAVE_LOBBY = 'PLAYER_LEAVE_LOBBY';


const receiveNewMessage = (msg, user) => ({
  type: NEW_MESSAGE,
  user,
  msg
})

const receiveJoinLobby =  (lobbyObj) => ({
  type: PLAYER_JOIN_LOBBY,
  lobbyer: lobbyObj
})

const receivePlayerLeave = (lobbyObj) => ({
  type: PLAYER_LEAVE_LOBBY,
  lobbyer: lobbyObj
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
        newState.lobbyers.push(action.lobbyer);
        break;

    case PLAYER_LEAVE_LOBBY:
        newState.lobbyers = state.lobbyers.filter(lobbyer =>
          lobbyer.socketId !== action.lobbyer.socketId
        )

      //   newState.lobbyers = R.filter((lobbyer) => lobbyer.socketId !== action.lobbyer.socketId,
      // state.lobberys)
        break;

    default:
        return state;
  }
  return newState;
}

module.exports = {lobby, receiveJoinLobby, receivePlayerLeave}
