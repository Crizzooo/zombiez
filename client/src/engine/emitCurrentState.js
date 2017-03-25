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
      // console.log('emitting this obj: ', currentPlayerObj);
      socket.emit('clientUpdate', currentPlayerObj);
      // console.log('client just sent out: ', currentPlayerObj);
      if (currentPlayerObj.fire && currentPlayerObj.fire.toX){
        console.log('WE EMITTED WITH A FIRE OBJECT', currentPlayerObj);
        store.dispatch(updateCurrentPlayer({fire: {}}));
        console.log('store after wiping fire: ');
        console.log(store.getState());
      }
    }
    // console.log('CLEARING CURRENT PLAYER');
  }, CLIENT_EMIT_INTERVAL);
  return emitID;
}

export const stopClientBroadcast = () => {
  clearInterval(emitID);
}
