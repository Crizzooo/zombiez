/* Action Types */
const UPDATE_LOBBY = 'UPDATE_LOBBY';
const SET_CURRENT_LOBBYER = 'SET_CURRENT_LOBBYER';
const RESET_LOBBY = 'RESET_LOBBY';
const SET_LOBBY = 'SET_LOBBY';
//TODO: Set Current Lobby

/* Action Creators */
export const dispatchLobbyUpdate = lobbyers => ({ type: UPDATE_LOBBY, lobbyers });
export const dispatchSetCurrentLobbyer = currentLobbyer => ({ type: SET_CURRENT_LOBBYER, currentLobbyer});
export const dispatchSetLobby = lobbyName => ({ type: SET_LOBBY, lobbyName });
export const resetLobby = () => ({ type: RESET_LOBBY });


const initialState = {
  lobbyers: [],
  currentLobbyer: {},
  currentLobby: ''
};

/* Reducer */
export default (state = initialState, action) => {

  let newState = Object.assign({}, state);

  switch (action.type) {

    case UPDATE_LOBBY:
      newState.lobbyers = action.lobbyers;
      break;

    case SET_CURRENT_LOBBYER:
      newState.currentLobbyer = action.currentLobbyer;
      break;

    case RESET_LOBBY:
      newState = initialState;
      break;

    case SET_LOBBY:
      newState.currentLobby = action.lobbyName;
      break;

    default:
      return state;
  }

  return newState;
};
