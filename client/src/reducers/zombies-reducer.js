import axios from 'axios';
import R from 'ramda';
import EVENT_LOOP_DELETE_TIME from '../engine/gameConstants.js';
import store from '../store.js';

/* Action Types */
const UPDATE_LOCAL_ZOMBIES = 'UPDATE_LOCAL_ZOMBIES';
const UPDATE_REMOTE_ZOMBIES = 'UPDATE_REMOTE_ZOMBIES';
const ZOMBIE_SHOT = 'ZOMBIE_SHOT';
const REMOVE_EVENT = 'REMOVE_EVENT';


/* Action Creators */
export const updateLocalZombies = zombieStates => ({ type: UPDATE_LOCAL_ZOMBIES, zombieStates });
export const updateRemoteZombies = serverZombieStates => ({ type: UPDATE_REMOTE_ZOMBIES, serverZombieStates});
export const dispatchZombieHitEvent = (eventObj, eventId) => ({ type: ZOMBIE_SHOT, event: eventObj });
export const removeEvent = (eventType, eventId) => ({ type: REMOVE_EVENT, type: eventType, eventId: eventId});
// export const updateRemoteZombies =


//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  localZombies: {},
  remote: {},
  localEvents: {
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

    case ZOMBIE_SHOT:
      if (!newState.localEvents.zombieTakeDamage[action.event.eventId]) {
        newState.localEvents.zombieTakeDamage[action.event.eventId] = action.event;
        // MOVE TO OWN FILE
        // setTimeout( dispatchRemoveEvent('zombieTakeDamage', action.event.eventId), EVENT_LOOP_DELETE_TIME * 1.5);
      }
      break;

    case REMOVE_EVENT:
      let newEvents = Object.assign({}, newState.localEvents);
      delete newEvents.localEvents[action.type][action.eventId];
      newState.localEvents = newEvents;
      break;

    default:
      return state;
  }

  return newState;
};

function dispatchRemoveEvent(eventName, eventId){
  store.dispatch(removeEvent('zombieTakeDamage', eventId));
}
