import store from './store.js';


import GenZed from './main.js';

//Import from Reducers
import { loadPlayers, setCurrentPlayer, changeGamePlaying, updatePlayers, playerLeaveGame } from './reducers/players-reducer.js';
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchLobbyUpdate, dispatchSetCurrentLobbyer } from './reducers/lobby-reducer.js';
import { dispatchGamePlaying } from './reducers/gameState-reducer';

import R from 'ramda';
import {throttle} from 'lodash';




//NOTE: SET UP DISPATCH LOBBY STATE !!!!!!!!!

//We attach all functions to a socket in here
const attachFunctions = (socket) => {
  socket.on('playerUpdate', dispatchPlayerUpdates);
  socket.on('currentLobbyer', dispatchCurrentLobbyer);
  socket.on('messagesUpdate', dispatchNewMessage);
  socket.on('turnOnGameComponent', dispatchGameTrue);
  socket.on('startGame', startClientGame);
  socket.on('updateLeaderboard', dispatchScoreUpdate);
  // socket.on('serverUpdate', dispatchNewGameState);
  socket.on('lobbyUpdate', dispatchLobbyState);
  socket.on('serverUpdate', dispatchServerState);
  socket.on('playerLeaveGame', dispatchPlayerLeaveGame);
};


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

function dispatchServerState(serverState) {
  // console.log('client received serverState:', serverState);

  //break out data from server - send to appropriate stores
  store.dispatch(dispatchLobbyUpdate(serverState.lobby.lobbyers));
  store.dispatch(updatePlayers(serverState.players));
  throttledLog();
}
const throttledLog = throttle(logReceivedState, 10000);
function logReceivedState() {
  console.log('state after server update: ', store.getState());
}
function dispatchPlayerUpdates(players) {
  console.log('Received Players:', players);
  //dispatch loadPlayers with players
  store.dispatch(loadPlayers(players));
}

function dispatchLobbyState(lobbyersFromServer){
  console.log('received lobby from server: ', lobbyersFromServer);
  store.dispatch(dispatchLobbyUpdate(lobbyersFromServer));
}

function dispatchScoreUpdate(playerId, score){
  store.dispatch(changePlayerScore(playerId, score));
}

function dispatchPlayerLeaveGame(playerSocketId){
  store.dispatch(playerLeaveGame(playerSocketId));
}

export default attachFunctions;
