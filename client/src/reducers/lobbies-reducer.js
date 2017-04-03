/* Action Types */
const UPDATE_LOBBIES = 'UPDATE_LOBBIES';
const RESET_LOBBIES = 'RESET_LOBBIES';

/* Action Creators */
export const dispatchLobbiesUpdate = lobbies => ({ type: UPDATE_LOBBIES, lobbies });
export const resetLobbies = () => ({ type: RESET_LOBBIES });


const initialState = {
  lobbies: []
};

/* Reducer */
export default (state = initialState, action) => {

  let newState = Object.assign({}, state);

  switch (action.type) {

    case UPDATE_LOBBIES:
      newState.lobbies = action.lobbies;
      console.log('client store updated lobbies: ', newState.lobbies);
      break;

    case RESET_LOBBIES:
      newState.lobbies = initialState.lobbies;
      break;

    default:
      return state;
  }

  return newState;
};
