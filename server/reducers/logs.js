const UPDATE_LOGS_FROM_PLAYER = 'UPDATE_PLAYER_LOGS';
const RESET_LOGS = 'RESET_LOGS';
const INITIALIZE_LOBBY = 'INITIALIZE_LOBBY';




// export const dispatchNewLog = (logMessage, logId) => ({ type: ADD_LOG, logMessage, logId });
//
// export const receiveLog = (logMessage, logId) => ({ type: RECEIVE_LOG, logMessage, logId });

const updateLogsFromClient = (senderId, logs) => ({ type: UPDATE_LOGS_FROM_PLAYER, senderId, logs});
const dispatchLogReset = () => ({ type: RESET_LOGS });

const initialLobbyState = {
  serverLogs: {}
}
const initialState = {}

const logsReducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  let newLogs = Object.assign({}, state.serverLogs);

  switch (action.type) {

    case INITIALIZE_LOBBY:
      console.log('initializing lobby in logs state');
      newState[action.lobbyName] = initialLobbyState;
      break;

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
