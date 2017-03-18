const initialState = {
  gameState: [],
  gamePlaying: false
};

/* Action Types */
const CHANGE_GAME_PLAYING = 'CHANGE_GAME_PLAYING';
const UPDATE_STATE = 'UPDATE_STATE';

/* Action creators */
export const dispatchGameUpdate = gameState => ({ type: UPDATE_STATE, gameState });
export const dispatchGamePlaying = gamePlayingStatus => ({ type: CHANGE_GAME_PLAYING, value: gamePlayingStatus });


/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case UPDATE_STATE:
      newState.gameState = action.gameState;
      break;

    case CHANGE_GAME_PLAYING:
      newState.gamePlaying = action.value;
      break;

    default:
      return state;
  }

  return newState;
};
