import store from '../store.js';

const CLIENT_EMIT_INTERVAL = 1000 / 30;


let emitID;
export default (socket) => {
    emitID = setInterval(() => {
    let state = store.getState();
    //send back players (and eventually zombies or bullets)

    //toDo: on remove player, clear interval for emitId

    let currentPlayerObj = state.players.currentPlayer;
    if (state.lobby.currentLobbyer.name){
      socket.emit('clientUpdate', {
        player: currentPlayerObj
      });
    }
  }, CLIENT_EMIT_INTERVAL);
  return emitID;
}

export const stopClientBroadcast = () => {
  clearInterval(emitID);
}
