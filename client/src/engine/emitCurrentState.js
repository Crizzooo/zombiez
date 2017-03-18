import store from '../store.js';

const CLIENT_EMIT_INTERVAL = 1000 / 30;

export default (socket) => {
   let emitID = setInterval(() => {
    let state = store.getState();
    //send back players (and eventually zombies or bullets)
    let currentPlayerObj = state.players.currentPlayer;
    socket.emit('clientUpdate', {
      player: currentPlayerObj
    });
  }, CLIENT_EMIT_INTERVAL);
  return emitID;
}
