import store from '../store.js';
import R from 'ramda';
import { EVENT_LOOP_DELETE_TIME, CHAT_LOG_CLEAR_TIME } from './gameConstants.js';
import { dispatchNewLog, removeLogFromStore } from '../reducers/gameLog-reducer.js';

let previousLogsHash = {};
let sentLogCount = 0;

const gameLogStyle = {
  font: "12px Arial",
  fill: "#FFF",
  stroke: "#000",
  strokeThickness: 3
};

var gameState;
export const initializeGameLog = (receivedState) => {
  // gameState.gameLogMessages = ['hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello', 'my name is'];
  gameState = receivedState;
  gameState.gameLogMessagesHolder = {}
  let canvas = $('canvas')[0];
  gameState.gameLog = receivedState.game.add.text(
    (canvas.width - 225),
    90,
    'starting text', gameLogStyle);
  gameState.gameLog.fixedToCamera = true;
  gameState.gameLog.align = 'left';
  gameState.gameLog.wordWrap = true;
  gameState.gameLog.wordWrapWidth = 225;
  gameState.gameLog.lineSpacing = 0.2;
}

export const updateGameLog = (gameState) => {
  let logs = store.getState().logs.receivedLogs;
  R.forEachObjIndexed(handlePlayerLogs, logs);
  renderLogsInGame();
}

const handlePlayerLogs = (setOfLogs) => {
  R.forEachObjIndexed(handleLogEvent, setOfLogs);
}

const handleLogEvent = (logObj) => {
  if (previousLogsHash[logObj.logId] === true){
    return;
  }
  previousLogsHash[logObj.logId] = true;
  gameState.gameLogMessagesHolder[logObj.logId] = logObj.message;

  //remove from game log visually
  setTimeout( () => {
    delete gameState.gameLogMessagesHolder[logObj.logId];
  }, CHAT_LOG_CLEAR_TIME);

  //remove from hash once safe to do so
  setTimeout( () => {
    if (gameState.previousLogsHash && gameState.previousLogsHash[logObj.logId]) {
    delete gameState.previousLogsHash[logObj.logId]; }
  }, EVENT_LOOP_DELETE_TIME * 1.5)
}

function renderLogsInGame() {
  let messagesArray = [];
  R.forEachObjIndexed( (obj) => {
    messagesArray.push(obj);
  }, gameState.gameLogMessagesHolder)
  if (messagesArray.length){
    let newText = messagesArray.join('\n');
    gameState.gameLog.text = newText;
  } else {
    gameState.gameLog.text = '';
  }
}

export function createNewGameLogMessage(msg){
  let logId = socket.id + sentLogCount++ + '';
  store.dispatch(dispatchNewLog(msg, logId));
  setTimeout( () => {
    store.dispatch(removeLogFromStore(logId));
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}
