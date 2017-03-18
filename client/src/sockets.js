import store from './store.js';
import { loadPlayers, setCurrentPlayer, changeGamePlaying, changePlayerScore } from './reducers/players-reducer.js';


import GenZed from './main.js';

//Import from Reducers
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchLobbyUpdate, dispatchSetCurrentLobbyer } from './reducers/lobby-reducer.js';
import { dispatchGamePlaying } from './reducers/gameState-reducer';

import R from 'ramda';




//NOTE: SET UP DISPATCH LOBBY STATE !!!!!!!!!

//We attach all functions to a socket in here
const attachFunctions = (socket) => {
  socket.on('playerUpdate', dispatchPlayerUpdates);
  socket.on('currentPlayer', dispatchCurrentLobbyer);
  socket.on('messagesUpdate', dispatchNewMessage);
  socket.on('turnOnGameComponent', dispatchGameTrue);
  socket.on('startGame', startClientGame);
  socket.on('updateLeaderboard', dispatchScoreUpdate);
  socket.on('serverUpdate', dispatchNewGameState);
  socket.on('lobbyUpdate', dispatchLobbyState);
};

function dispatchPlayerUpdates(players) {
  console.log('Received Players:', players);
  //dispatch loadPlayers with players
  store.dispatch(loadPlayers(players));
}

function dispatchCurrentLobbyer(lobbyerObj) {
  store.dispatch(dispatchSetCurrentLobbyer(lobbyerObj));
}

//sample function
export function dispatchNewMessage(msgObj) {
  store.dispatch(addMessage(msgObj));
}

function dispatchGameTrue(){
  store.dispatch(dispatchGamePlaying(true));
}

function startClientGame(players, startDate) {
  let state = store.getState();
  ZG.game = new GenZed('100%', '100%', Phaser.AUTO, 'game');
  ZG.game.startGame('BootState', true, false, state.lobby.lobbyers);
}

function dispatchNewGameState(playerObjects) {
  console.log('client received new GameState:', playerObjects);
  // store.dispatch(dispatchGameUpdate(playerObjects));
}

function dispatchScoreUpdate(playerId, score){
  store.dispatch(changePlayerScore(playerId, score));
}

function dispatchLobbyState(lobbyersFromServer){
  console.log('received from server: ', lobbyersFromServer);
  store.dispatch(dispatchLobbyUpdate(lobbyersFromServer));
}

export default attachFunctions;
