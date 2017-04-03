const R = require('ramda');
const INITIALIZE_LOBBY = 'INITIALIZE_LOBBY';
const NEW_MESSAGE = 'NEW_MESSSAGE';
const PLAYER_JOIN_LOBBY = 'PLAYER_JOIN_LOBBY';
const LOBBYER_LEAVE_LOBBY = 'LOBBYER_LEAVE_LOBBY';
const RESET_LOBBY = 'RESET_LOBBY';
const UPGRADE_GUN = 'UPGRADE_GUN';


const initializeLobby = (lobbyName) => ({
  type: INITIALIZE_LOBBY,
  lobbyName
});

const receiveNewMessage = (msg, user) => ({
  type: NEW_MESSAGE,
  user,
  msg
})

const receiveJoinLobby =  (lobbyObj) => ({
  type: PLAYER_JOIN_LOBBY,
  lobbyer: lobbyObj,
  lobby
})

const receiveLobbyerLeave = (lobbyerId, lobby) => ({
  type: LOBBYER_LEAVE_LOBBY,
  lobbyerId,
  lobby
})

const resetLobby = () => ({
  type: RESET_LOBBY
})

const upgradeGun = (gunLvl, lobbyerId) => ({
  type: UPGRADE_GUN,
  gunLvl,
  lobbyerId,
})

const initialLobbyState = {
  lobbyers: [],
  messages: []
}
const initialState = {
};

const lobby = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  let newLobbies = Object.assign({}, state);
  newState = newLobbies;

  switch (action.type) {

    case INITIALIZE_LOBBY:
        newState[action.lobbyName] = initialLobbyState;
        console.log('new state after new lobby will be: ', newState);
        break;

    case NEW_MESSAGE:
        //TODO: we probably arent doing anything with this. Server should just be emitting the message to local clients
        newState.messages = [ ...state.messages, {user: action.user, message: action.msg}];
        break;

    case PLAYER_JOIN_LOBBY:
        let lobbyToUpdate = Object.assign({},
          newState[action.lobbyer.lobby]
        )
        if (lobbyToUpdate.lobbyers && lobbyToUpdate.lobbyers.length){
          lobbyToUpdate.lobbyers = [...lobbyersToUpdate, action.lobbyer];
          newState[action.lobbyer.lobby] = lobbyToUpdate;
        } else {
          newState[action.lobbyer.lobby].lobbyers = [action.lobbyer];
        }
        break;

    case LOBBYER_LEAVE_LOBBY:
        newState[action.lobby].lobbyers = newState[action.lobby].lobbyers.filter(lobbyer => lobbyer.socketId !== action.lobbyerId);
        break;

    case UPGRADE_GUN:
        let lobbyerToChange = newState.lobbyers.filter(lobbyer => lobbyer.socketId === action.lobbyerId)[0];
        lobbyerToChange.gunLvl = action.gunLvl;
        let newLobby = newState.lobbyers;
        newLobby[lobbyerToChange.playerNumber-1] = lobbyerToChange;
        newState.lobbyers = newLobby;
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

module.exports = {lobby, initializeLobby, receiveJoinLobby, receiveLobbyerLeave, resetLobby, upgradeGun}
