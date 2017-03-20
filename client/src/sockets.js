import store from './store.js';


import GenZed from './main.js';

//Import from Reducers
import { loadPlayers, changeGamePlaying, updatePlayers, playerLeaveGame, resetPlayers, updateCurrentPlayer } from './reducers/players-reducer.js';
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchLobbyUpdate, dispatchSetCurrentLobbyer, resetLobby } from './reducers/lobby-reducer.js';
import { dispatchGamePlaying } from './reducers/gameState-reducer';


import R from 'ramda';
import {throttle} from 'lodash';


//We attach all functions to a socket in here
const attachFunctions = (socket) => {
  socket.on('playerUpdate', dispatchPlayerUpdates);
  socket.on('currentLobbyer', dispatchCurrentLobbyer);
  socket.on('messagesUpdate', dispatchNewMessage);
  socket.on('startGame', startClientGame);
  socket.on('updateLeaderboard', dispatchScoreUpdate);
  socket.on('lobbyUpdate', dispatchLobbyState);
  socket.on('serverUpdate', dispatchServerState);
  socket.on('gamePlayingUpdate', dispatchGamePlayingUpdate);
  socket.on('resetGame', dispatchReducerReset);
};

function dispatchCurrentLobbyer(lobbyerObj) {
  lobbyerObj.socketId = socket.id;
  store.dispatch(dispatchSetCurrentLobbyer(lobbyerObj));
}

export function dispatchNewMessage(msgObj) {
  store.dispatch(addMessage(msgObj));
}

function dispatchGamePlayingUpdate(isItPlaying){
  console.log('before playing update', store.getState());
  store.dispatch(dispatchGamePlaying(isItPlaying));
  console.log(' after game playing update', store.getState());
}

function startClientGame(playersFromServer) {
  let state = store.getState();
  console.log('client is starting game with this from server: ', state);
  console.log('these are the players being sent to store: ', playersFromServer);
  ZG.game = new GenZed('100%', '100%', Phaser.AUTO, 'game');
  store.dispatch(loadPlayers(playersFromServer));
  ZG.game.startGame('BootState', true, false);
}

function dispatchServerState(serverState) {
  //break out data from server - send to appropriate stores
  let state = store.getState();
  store.dispatch(dispatchLobbyUpdate(serverState.lobby.lobbyers));
  if (state.game.gamePlaying){
    let playerStateUpdate = serverState.players.playerStates;
    if (playerStateUpdate[socket.id]){
      console.log('player state update: ', playerStateUpdate);
      delete playerStateUpdate[socket.id];
      console.log('after deleting self: ', playerStateUpdate);
    }
    store.dispatch(updatePlayers(playerStateUpdate));
  }
  throttledLog();
}
const throttledLog = throttle(logReceivedState, 30000);
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
  console.log('store after receiving lobby: ', store.getState());
}

function dispatchScoreUpdate(playerId, score){
  store.dispatch(changePlayerScore(playerId, score));
}

function dispatchReducerReset(){
  //game reducer has already been set to true
  //reset players reducer
  store.dispatch(resetPlayers());
  store.dispatch(resetLobby());
  //reset zombies and other game related reducers

}

export default attachFunctions;
