const R = require('ramda');
const throttle = require('lodash').throttle;

// Constants
 const PLAYER_HEALTH = require('../../client/src/engine/gameConstants.js').PLAYER_HEALTH;
// Action Types
const ADD_PLAYER = 'ADD_PLAYER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const RECEIVE_CLIENT_DATA = 'RECEIVE_CLIENT_DATA';
const RESET_PLAYERS = 'RESET_PLAYERS';
const UPDATE_PLAYER = 'UPDATE_PLAYER';
const DAMAGE_PLAYER = 'DAMAGE_PLAYER';
const RESET_PLAYER_FIRES = 'RESET_PLAYER_FIRES';

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

const resetPlayerFires = () => ({
  type: RESET_PLAYER_FIRES
})


const initialState = { playerStates: {}, playerHealths: {}, bulletHash: {} };

const throttleLog = throttle( () => console.log('did not recieve a hash'), 1000);
const throttleReceiveBulletHash = throttle( (action) => {
  console.log('server received bullet hash: ', action);
  console.log('at :', new Date());
}, 1000)

const playerReducers = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  switch (action.type) {

    case ADD_PLAYER: {
      // console.log("Server is adding a player from: ", action.playerState);
      let newPlayerStates = Object.assign({}, state.playerStates);
      newPlayerStates[action.playerState.socketId] = action.playerState;
      newState.bulletHash[action.playerState.socketId] = {};
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
      if (Object.keys(action.playerToUpdate.bulletHash).length > 0){
        throttleReceiveBulletHash(action.playerToUpdate);
      } else {
        throttleLog();
      }
      // if (action.playerToUpdate.fire && action.playerToUpdate.fire.toX){
      //   console.log('server got a fire object!');
      //   console.dir(action.playerToUpdate.fire, { depth: 4 });
      //   let bulletId = action.playerToUpdate.fire.bulletId;
      //   newState.bulletHash[bulletId] = true;
      //   setTimeout( () => {
      //     console.log('bullet hash pre delete for socket id', bulletId);
      //     console.dir(newState.bulletHash);
      //     delete newState.bulletHash[bulletId];
      //     console.log('after: ');
      //     console.dir(newState.bulletHash);
      //   }, 1000)
      // }
      if (!action.playerToUpdate.socketId){
        return state;
      }
      // if (newPlayerStates[action.playerToUpdate.socketId].health !== state.playerHealths[action.playerToUpdate.socketId]){
      //   newPlayerStates[action.playerToUpdate.socketId].health = state.playerHealths[action.playerToUpdate.socketId];
      // }
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

    case RESET_PLAYER_FIRES: {
      let newPlayerStates = Object.assign({}, state.playerStates);
      R.forEachObjIndexed( (playerState) => {
        // console.log('removing fire obj from this playerState');

        // console.log('playerState pre remove fire: ', playerState);
        newPlayerStates[playerState.socketId].fire = {};
      }, newPlayerStates);
      // console.log('after ramda');
      newState.playerStates = newPlayerStates;
      // console.log('server player states after emitting and resetting: ', newState.playerStates);
    }

    default:
      return state;
  }
  return newState;
}

module.exports = { playerReducers, removePlayer, receiveClientData, resetPlayers, addPlayer, updatePlayer, resetPlayerFires };
