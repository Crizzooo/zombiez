const R = require('ramda');
const throttle = require('lodash').throttle;

// Constants
 const {PLAYER_HEALTH, EVENT_LOOP_DELETE_TIME } = require('../../client/src/engine/gameConstants.js');

// Action Types
const ADD_PLAYER_ID = 'ADD_PLAYER_ID';
const UPDATE_ZOMBIES_FROM_CLIENT = 'UPDATE_ZOMBIES_FROM_CLIENT';
const RESET_ZOMBIES = 'RESET_ZOMBIES';

// Action Creators
// const removePlayer = id => ({
//   type: REMOVE_PLAYER,
//   id
// });

const updateZombiesFromClient = (socketId, zombies) => ({
  type: UPDATE_ZOMBIES_FROM_CLIENT,
  socketId,
  zombies
});

// const damagePlayer = (dmgToTake, socketId) => ({
//   type: DAMAGE_PLAYER,
//   amount: dmgToTake,
//   socketId
// })

const addPlayerToZombieSprites = (socketId) => ({
  type: ADD_PLAYER_ID,
  socketId
})

const resetZombies = () => ({
  type: RESET_ZOMBIES
})

const throttleLog = throttle( () => console.log('did not recieve a hash'), 1000);
const throttleReceiveEventHash = throttle( (action) => {
  console.log('server received an event in the player hash: ', action);
  console.log('at :', new Date());
}, EVENT_LOOP_DELETE_TIME / 10)


const initialState = {
  zombieSprites: {},
  zombieGiveDamageEvents: {

  },
  zombieTakeDamageEvents: {

  }
}

const zombieReducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  let newZombieState = Object.assign({}, state.zombieSprites);
  switch (action.type) {

    case ADD_PLAYER_ID: {
      //TODO: add player Id to zombieSprites object
      console.log('ADDING PLAYER: ', action);
      newZombieState[action.socketId] = {};
      newState.zombieSprites = newZombieState;
      break;
    }

    case UPDATE_ZOMBIES_FROM_CLIENT: {
      console.log('pre server update zombies: ', newZombieState);
      newZombieState[action.socketId] = action.zombies;
      newState.zombieSprites = newZombieState;
      console.log('post server update zombies: ', newState.zombieSprites);
      break;
    }

    case RESET_ZOMBIES: {
      newState = initialState;
      break;
    }

    // case RESET_PLAYERS: {
    //   newState.playerStates = {};
    //   break;
    // }
    //
    // case REMOVE_PLAYER: {
    //   break;
    // }
    //
    // case DAMAGE_PLAYER: {
    //   let newPlayerHealths = Object.assign({}, state.playerHealths);
    //   newPlayerHealths[action.socketId].health -= action.amount;
    //   newState.playerHealths = newPlayerHealths;
    // }

    default:
      return state;
  }
  return newState;
}

module.exports = { zombieReducer, addPlayerToZombieSprites, updateZombiesFromClient, resetZombies };