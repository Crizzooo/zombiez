/* Action Types */
const UPDATE_LOBBY = 'UPDATE_LOBBY';
const SET_CURRENT_LOBBYER = 'SET_CURRENT_LOBBYER';

/* Action Creators */
export const dispatchLobbyUpdate = lobbyers => ({ type: UPDATE_LOBBY, lobbyers });
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
      newState.lobbyers = action.lobbyers;
      break;
    case SET_CURRENT_LOBBYER:
      newState.currentLobbyer = action.currentLobbyer;
      break;

    default:
      return state;
  }

  return newState;
};
