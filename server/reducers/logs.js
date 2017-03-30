const UPDATE_LOGS_FROM_PLAYER = 'UPDATE_PLAYER_LOGS';
const RESET_LOGS = 'RESET_LOGS'




// export const dispatchNewLog = (logMessage, logId) => ({ type: ADD_LOG, logMessage, logId });
//
// export const receiveLog = (logMessage, logId) => ({ type: RECEIVE_LOG, logMessage, logId });

const updateLogsFromClient = (senderId, logs) => ({ type: UPDATE_LOGS_FROM_PLAYER, senderId, logs});
const dispatchLogReset = () => ({ type: RESET_LOGS });

const initialState = {
  serverLogs: {}
}

const logsReducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  let newLogs = Object.assign({}, state.serverLogs);

  switch (action.type) {

    case UPDATE_LOGS_FROM_PLAYER:
      newLogs[action.senderId] = action.logs;
      newState.serverLogs = newLogs;
      break;

    case RESET_LOGS:
      newState = initialState;
      break;

    default:
      return state;
  }
  return newState;
}

module.exports = {updateLogsFromClient, logsReducer, dispatchLogReset};
