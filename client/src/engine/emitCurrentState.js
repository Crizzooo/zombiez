import store from '../store.js';
import { updateCurrentPlayer } from '../reducers/players-reducer';

const CLIENT_EMIT_INTERVAL = 1000 / 30;


let emitID;
export default (socket) => {
    emitID = setInterval(() => {
    let state = store.getState();
    //send back players (and eventually zombies or bullets)

    //toDo: on remove player, clear interval for emitId

    let currentPlayerObj = state.players.currentPlayer;
    if (state.lobby.currentLobbyer.name && state.game.gamePlaying){
      console.log('emitting this obj: ', currentPlayerObj);
      socket.emit('clientUpdate', currentPlayerObj);
      if (currentPlayerObj.fire && currentPlayerObj.fire.toX){
        console.log('WE EMITTED WITH A FIRE OBJECT');
      }
    }
    console.log('CLEARING CURRENT PLAYER');
    store.dispatch(updateCurrentPlayer({fire: {}}));
  }, CLIENT_EMIT_INTERVAL);
  return emitID;
}

export const stopClientBroadcast = () => {
  clearInterval(emitID);
}
