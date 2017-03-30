import store from '../../store.js';
import { dispatchNewLog, removeLogFromStore } from '../../reducers/gameLog-reducer.js';
import { EVENT_LOOP_DELETE_TIME } from '../../engine/gameConstants.js';


let eventLogCount = 0;

export const createEventLog = (msg) => {
  eventLogCount = eventLogCount+1;
  let newLogId = socket.id + eventLogCount + '';
  store.dispatch(dispatchNewLog(msg, newLogId));
  console.log('new event log count: ', eventlogCount);
  setTimeout( () => {
    store.dispatch(removeLogFromStore(newLogId));
  }, EVENT_LOOP_DELETE_TIME);
}
