/* Action Types */
const UPDATE_LOBBY = 'UPDATE_LOBBY';
const SET_CURRENT_LOBBYER = 'SET_CURRENT_LOBBYER';

/* Action Creators */
export const dispatchLobbyUpdate = lobbyState => ({ type: UPDATE_LOBBY, lobbyState });
export const dispatchSetCurrentLobbyer = currentLobbyer => ({ type: SET_CURRENT_LOBBYER, currentLobbyer});



const initialState = {
  lobbyers: [],
  currentLobbyer: {}
};

/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case UPDATE_LOBBY:
      console.log('reducer updating lobbyers to: ', action.lobbyState);
      newState.lobbyers = action.lobbyState;
      break;
    case SET_CURRENT_LOBBYER:
      console.log('setting current lobbyer to: ', action.currentLobbyer);
      newState.currentLobbyer = action.currentLobbyer;
      break;
      
    default:
      return state;
  }

  return newState;
};
