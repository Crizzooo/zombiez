const TIMER_TICK = 'TIMER_TICK';
const ADD_PLAYER = 'ADD_PLAYER';
const GAME_PLAYING = 'GAME_PLAYING';
const RESET_ENGINE = 'RESET_ENGINE'


const resetEngine = () => ({
  type: RESET_ENGINE
});

const gamePlaying = (gamePlaying) => ({
  type: GAME_PLAYING,
  gamePlaying
});

const initialState = {
  gamePlaying: false
}

const engineReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  switch (action.type) {

    case GAME_PLAYING:
      newState.gamePlaying = action.gamePlaying;
      break;

    case RESET_ENGINE:
      return initialState;

    default:
      return state;
  }
  return newState;
}

module.exports = {engineReducers, resetEngine, gamePlaying};
