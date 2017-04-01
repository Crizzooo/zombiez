const R = require('ramda');
const throttle = require('lodash').throttle;

// Constants
 const {PLAYER_HEALTH, EVENT_LOOP_DELETE_TIME } = require('../../client/src/engine/gameConstants.js');
// Action Types
const ADD_PLAYER = 'ADD_PLAYER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const RECEIVE_CLIENT_DATA = 'RECEIVE_CLIENT_DATA';
const RESET_PLAYERS = 'RESET_PLAYERS';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const DAMAGE_PLAYER = 'DAMAGE_PLAYER';

// Action Creators
const addPlayer = playerState => ({
  type: ADD_PLAYER,
  playerState
});

const removePlayer = id => ({
  type: REMOVE_PLAYER,
  id
});

const receiveClientData = (id, data) => ({
  type: RECEIVE_CLIENT_DATA,
  id,
  data
});

const updatePlayer = (playerToUpdate) => ({
  type: UPDATE_PLAYER,
  playerToUpdate
});

const resetPlayers = () => ({
  type: RESET_PLAYERS
});

const damagePlayer = (dmgToTake, socketId) => ({
  type: DAMAGE_PLAYER,
  amount: dmgToTake,
  socketId
})


const initialState = { playerStates: {}, playerHealths: {} };

const throttleLog = throttle( () => console.log('did not recieve a hash'), 1000);
const throttleReceiveEventHash = throttle( (action) => {
  console.log('server received an event in the player hash: ', action);
  console.log('at :', new Date());
}, EVENT_LOOP_DELETE_TIME / 10)

const receivedBulletEvents = {};

const playerReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  switch (action.type) {

    case ADD_PLAYER: {
      // console.log("Server is adding a player from: ", action.playerState);
      let newPlayerStates = Object.assign({}, state.playerStates);
      newPlayerStates[action.playerState.socketId] = action.playerState;
      // let newPlayerHealths = Object.assign({}, state.playerHealths);
      // newPlayerHealths[action.playerState.socketId] = PLAYER_HEALTH;
      newState.playerStates = newPlayerStates;
      // newState.playerHealths = newPlayerHealths;
      // console.log('player reducer after add player: ', newState);
      break;
    }

    case UPDATE_PLAYER: {
      // console.log('Update received this action: ', action);
      let newPlayerStates = Object.assign({}, state.playerStates);
      newPlayerStates[action.playerToUpdate.socketId] = action.playerToUpdate;
      // if (
      //   (action.playerToUpdate.bulletHash && (Object.keys(action.playerToUpdate.bulletHash).length) > 0)
      //    ||
      //   ( action.playerToUpdate.playerDamageHash && Object.keys(action.playerToUpdate.playerDamageHash).length > 0)
      //   || (action.playerToUpdate.playerPickupHash &&
      //   (Object.keys(action.playerToUpdate.playerPickupHash).length>0))){
      //   //we've received an event
      //   throttleReceiveEventHash(newPlayerStates);
      // } else {
      //   throttleLog();
      // }
      // if (!action.playerToUpdate.socketId){
      //   return state;
      // }
      if (action.playerToUpdate.bulletHash && (Object.keys(action.playerToUpdate.bulletHash).length > 0)){
        R.forEachObjIndexed( (bulletEvent, hashEventId) => {
          if(receivedBulletEvents[hashEventId] !== true){
            // console.log('hashEventId: ', hashEventId);
            // console.dir(bulletEvent);
            receivedBulletEvents[hashEventId] = true;
          }
        }, action.playerToUpdate.bulletHash);
      }
      newState.playerStates = newPlayerStates;
      break;
    }

    case RESET_PLAYERS: {
      newState.playerStates = {};
      break;
    }

    case REMOVE_PLAYER: {
      let newPlayerStates = Object.assign({}, state.playerStates);
      // console.log('server received remove player: ', action.id);
      if (newPlayerStates['undefined']){
        delete newPlayerStates['undefined'];
      }
      if (newPlayerStates[action.id]){
        delete newPlayerStates[action.id];
      }
      newState.playerStates = newPlayerStates;
      break;
    }

    case DAMAGE_PLAYER: {
      let newPlayerHealths = Object.assign({}, state.playerHealths);
      newPlayerHealths[action.socketId].health -= action.amount;
      newState.playerHealths = newPlayerHealths;
    }

    default:
      return state;
  }
  return newState;
}

module.exports = { playerReducers, removePlayer, receiveClientData, resetPlayers, addPlayer, updatePlayer };
