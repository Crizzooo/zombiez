import store from './store.js';
import GenZed from './main.js';

import R from 'ramda';
import {throttle} from 'lodash';


//Import from Reducers
import { loadPlayers, changeGamePlaying, updatePlayers, playerLeaveGame, resetPlayers, updateCurrentPlayer } from './reducers/players-reducer.js';
import { loadMessages, addMessage } from './reducers/chatApp-reducer.js';
import { dispatchLobbyUpdate, dispatchSetCurrentLobbyer, resetLobby } from './reducers/lobby-reducer.js';
import { dispatchGamePlaying } from './reducers/gameState-reducer';
import { updateRemoteZombies, dispatchZombiesReset } from './reducers/zombies-reducer';
import { stopClientBroadcast } from './engine/emitCurrentState';


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
  store.dispatch(dispatchGamePlaying(isItPlaying));
}

//game starts here
function startClientGame(playersFromServer) {
  let state = store.getState();
  console.log('client is starting game with this from server: ', playersFromServer);
  ZG.game = new GenZed('100', '100', Phaser.AUTO, 'game');
  store.dispatch(loadPlayers(playersFromServer));
  ZG.game.startGame('BootState', true, false, "../assets/levels/main.json");
}


const throttledLog = throttle(logReceivedState, 30000);
function logReceivedState() {
  // console.log('state after server update: ', store.getState());
}
function dispatchServerState(serverState) {
  //break out data from server - send to appropriate stores
  let state = store.getState();
  //store.dispatch(dispatchLobbyUpdate(serverState.lobby.lobbyers));
  if (state.game.gamePlaying){
    let playerStateUpdate = serverState.players.playerStates;
    // console.log('update pre-remove CP: ', playerStateUpdate);
    if (playerStateUpdate[socket.id]){
      //If server has a different health for yourself, correct it
      //You will then update the server with the correct health on next broadcast


      //NOTE: reimplement if health issues
      // if( currentPlayerSprite.stats && (playerStateUpdate[socket.id].health !== serverState.players.playerHealths[socket.id])){
      //     currentPlayerSprite.stats.health = serverState.players.playerHealths[socket.id];
      // }
      delete playerStateUpdate[socket.id];
    }

    if (serverState.zombies.zombieSprites && serverState.zombies.zombieSprites[socket.id]){
      // console.log('received this zombie update pre remove: ', serverState.zombies.zombieSprites);
      delete serverState.zombies.zombieSprites[socket.id];
      // console.log('after remove, ready to dispatch: ', serverState.zombies.zombieSprites);
      store.dispatch(updateRemoteZombies(serverState.zombies.zombieSprites));
    }
    // console.log('and after deleting: ', playerStateUpdate);
    //TODO: if player state update has nothing, dont dispatch
    if (!(Object.keys(playerStateUpdate) === [] || Object.keys(playerStateUpdate) === ['undefined'])){
        store.dispatch(updatePlayers(playerStateUpdate));
    }

    //TODO: pull off zombies and dispatch to local store
    //TODO: filter out zombies under player socket Id


  }
  throttledLog();
}

function dispatchPlayerUpdates(players) {
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
  //reset local reducers
  store.dispatch(resetPlayers());
  store.dispatch(dispatchGamePlaying(false));
  store.dispatch(dispatchZombiesReset());
  store.dispatch(resetLobby());
  const textInput = document.getElementById("createMessage");
  const gameDiv = document.getElementById("game");

  //Stop game, remove the canvas, and return the cursor
  ZG.game.destroy();
  $('canvas').remove();
  document.body.style.cursor = 'default';

  console.log('bring back lobby stuff ');
  document.getElementsByClassName("container")[0].style.visibility = "visible";
  textInput.focus();
  //TODO: reset zombies and other game related reducers
}

export default attachFunctions;
