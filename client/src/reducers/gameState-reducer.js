const initialState = {
  gamePlaying: false
};

/* Action Types */
const CHANGE_GAME_PLAYING = 'CHANGE_GAME_PLAYING';

/* Action creators */
export const dispatchGamePlaying = gamePlayingStatus => ({ type: CHANGE_GAME_PLAYING, value: gamePlayingStatus });


/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case CHANGE_GAME_PLAYING:
      newState.gamePlaying = action.value;
      break;

    default:
      return state;
  }

  return newState;
};
