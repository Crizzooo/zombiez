import axios from 'axios';
import R from 'ramda';

/* Action Types */
const UPDATE_LOCAL_ZOMBIES = 'UPDATE_LOCAL_ZOMBIES';
const UPDATE_REMOTE_ZOMBIES = 'UPDATE_REMOTE_ZOMBIES';


/* Action Creators */
export const updateLocalZombies = zombieStates => ({ type: UPDATE_LOCAL_ZOMBIES, zombieStates });
export const updateRemoteZombies = serverZombieStates => ({ type: UPDATE_REMOTE_ZOMBIES, serverZombieStates});
// export const updateRemoteZombies =


//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  localZombies: {},
  remote: {},
  events: {
    zombieTakeDamage: {},
    zombieGiveDamage: {}
  }
};

//NOTE: create action creators to create events and attach them

/* Reducer */
export default (state = initialState, action) => {

  let newState = Object.assign({}, state, {localZombies: state.localZombies});
  let newLocalZombies = Object.assign({}, state.localZombies);

  switch (action.type) {

    case UPDATE_LOCAL_ZOMBIES:
      //if there is a socket id, make it current player and remove him from playerStates
      newLocalZombies = Object.assign(newLocalZombies, action.zombieStates)
      newState.localZombies = newLocalZombies;
      break;

    case UPDATE_REMOTE_ZOMBIES:
      let newRemoteZombies = Object.assign({}, action.serverZombieStates);
      newState.remote = newRemoteZombies;
      break;

    default:
      return state;
  }

  return newState;
};
