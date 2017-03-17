const TIMER_TICK = 'TIMER_TICK';
const ADD_PLAYER = 'ADD_PLAYER';

const timerTicker = (minutes, seconds) => ({
  type: TIMER_TICK,
  minutes,
  seconds
})

const resetEngine = () => ({
  type: RESET_ENGINE
});

const addPlayer = () => ({
  type: ADD_PLAYER
})

const engineReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  switch(action.type) {
    case TIMER_TICK:

      break;

    case ADD_PLAYER:

      break;

    case RESET_ENGINE:
      return initialState;

    default:
      return state;
  }
  return newState;
}

module.exports = {timerTicker, addPlayer, engineReducers, resetEngine}
