const initialState = {
  gameState: [],
  gamePlaying: false
};

/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case UPDATE_STATE:
      // newState.allPlayers = action.allPlayers;
      // PB.customParams.players = newState.allPlayers;
      console.log('Reducer recieved:', action.gameState);
      newState.gameState = action.gameState;
      ZG.players = action.gameState;
      break;

    default:
      return state;
  }

  return newState;
};

/* Action Types */
// const ADD_PLAYER = 'ADD_PLAYER';
const UPDATE_STATE = 'UPDATE_STATE';


/* Action Creators */
export const dispatchGameUpdate = gameState => ({ type: UPDATE_STATE, gameState });

/* Action Dispatchers */
