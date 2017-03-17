import store from './store.js';
import { loadPlayers, setCurrentPlayer, changeGamePlaying, changePlayerScore } from './reducers/players-reducer.js';
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchGameUpdate } from './reducers/gameState-reducer.js';

import BootState from './gameStates/boot.js';
import PreloadState from './gameStates/preload.js';
import ZombieGameState from './gameStates/zombieGameState.js';

import GenZed from './main.js';

//Import from Lobby Reducer
import { dispatchLobbyUpdate, dispatchSetCurrentLobbyer } from './reducers/lobby-reducer.js';

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
  store.dispatch(changeGamePlaying(true));
}

function startClientGame(players, startDate) {
  console.log('Sockets are starting games with Players:', ZG.players);
  console.log('GAME STARTING DATE: ', startDate);
  console.log('typeof startDate pre parse: ', typeof startDate);
  ZG.startDate = Date.parse(startDate);
  console.log('typeafter ', typeof Date.parse(startDate));
  ZG.game = new GenZed('100%', '100%', Phaser.AUTO, 'game');
  ZG.game.startGame('BootState', true, false, players);
  // ZG.game.state.add('Boot', BootState);
  // ZG.game.state.add('Preload', PreloadState);
  // ZG.game.state.add('ZombieGameState', ZombieGameState);
  // ZG.game.state.start('Boot', true, false, players);
}

function dispatchNewGameState(playerObjects) {
  console.log('client received new GameState:', playerObjects);
  store.dispatch(dispatchGameUpdate(playerObjects));
}

function dispatchScoreUpdate(playerId, score){
  store.dispatch(changePlayerScore(playerId, score));
}

function dispatchLobbyState(lobbyersFromServer){
  console.log('received from server: ', lobbyersFromServer);
  store.dispatch(dispatchLobbyUpdate(lobbyersFromServer));
}

export default attachFunctions;
