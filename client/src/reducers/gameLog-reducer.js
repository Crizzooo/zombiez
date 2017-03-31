

// Search project for all TODO: MSG
// When I hit a player     - update - bulletHitPlayer
// When I kill a player    - update - handlePlayerDamage
// When I advance a medal  - player.upgradeGun
// When I leave the game   - socket.on(disconnect), emit to server reducer

// When I pick up a powerup - not neededd yet

// process
  // add logs to currentPlayerSprite

/* Action Types */
const RECEIVE_LOGS = 'RECEIVE_LOG';
const ADD_LOG = 'ADD_LOG';
const REMOVE_LOG = 'REMOVE_LOG';

/* Action Creators */
export const dispatchServerLogs = (logsFromServer) => ({ type: RECEIVE_LOGS,  logsFromServer });
export const dispatchNewLog = (logMessage, logId) => ({ type: ADD_LOG, logMessage, logId });
export const removeLogFromStore = (logId) => ({ type: REMOVE_LOG, logId});

//used to check against logs from the server
const hashOfLogs = {};

const initialState = {
  receivedLogs: {},
  logsToSend: {}
};

/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);
  let newReceivedLogs = Object.assign({},  {receivedLogs: state.receivedLogs});
  let newLogsToSend = Object.assign({}, state.logsToSend);

  switch (action.type) {

    case RECEIVE_LOGS:
      newReceivedLogs = action.logsFromServer;
      newState.receivedLogs = newReceivedLogs;
      break;

    case ADD_LOG:
      newLogsToSend[action.logId] = { message: action.logMessage, logId: action.logId}
      newState.logsToSend = newLogsToSend;
      break;

    case REMOVE_LOG:
      //if logId is in my state, delete it
      if (newLogsToSend[action.logId]) {
        delete newLogsToSend[action.logId];
      }
      newState.logsToSend = newLogsToSend;
      break;

    default:
      return state;
  }
  return newState
};
