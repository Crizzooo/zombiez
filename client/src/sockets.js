import store from './store.js';
import { loadPlayers, setCurrentPlayer, changeGamePlaying, changePlayerScore } from './reducers/players-reducer.js';
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchGameUpdate } from './reducers/gameState-reducer.js';

import GenZed from './main.js'



//We attach all functions to a socket in here
const attachFunctions = (socket) => {
  socket.on('playerUpdate', dispatchPlayerUpdates);
  socket.on('currentPlayer', dispatchCurrentPlayer);
  socket.on('messagesUpdate', dispatchNewMessage);
  socket.on('turnOnGameComponent', dispatchGameTrue);
  socket.on('startGame', startClientGame);
  socket.on('updateLeaderboard', dispatchScoreUpdate);
  // socket.on('GameStateChange', dispatchNewGameState);
};

function dispatchPlayerUpdates(players) {
  console.log('Received Players:', players);
  //dispatch loadPlayers with players
  store.dispatch(loadPlayers(players));
}

function dispatchCurrentPlayer(playerObj) {
  store.dispatch(setCurrentPlayer(playerObj));
}

//sample function
export function dispatchNewMessage(msgObj) {
  store.dispatch(addMessage(msgObj));
}

function dispatchGameTrue(){
  store.dispatch(changeGamePlaying(true));
}

function startClientGame(players) {
  console.log('Sockets are starting games with Players:', ZG.players);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Game Starts HERE!
  ZG.game = new GenZed(300, 300, Phaser.AUTO, 'game');
  ZG.game.startGame('BootState', true, false, "../assets/levels/tutorial.json", players);
}

function dispatchNewGameState(playerObjects) {
  console.log('client received new GameState:', playerObjects);
  store.dispatch(dispatchGameUpdate(playerObjects));
}

function dispatchScoreUpdate(playerId, score){
  store.dispatch(changePlayerScore(playerId, score));
}

export default attachFunctions;
