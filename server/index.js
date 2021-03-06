const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const R = require('ramda');
const throttle = require('lodash.throttle');

//Import Store
const store = require('./store.js');

//Store Dispatchers
const {receiveJoinLobby, receiveLobbyerLeave, upgradeGun} = require('./reducers/lobby.js');
const {updatePlayer, removePlayer} = require('./reducers/players.js');
const {updateZombiesFromClient} = require('./reducers/zombies.js');
const {updateLogsFromClient} = require('./reducers/logs.js');
//Import helper functions
const {startGame, endGame} = require('./engine/updateClientLoop.js');


const server = app.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
})

const io = require('socket.io')(server);


/* initiate middleware */
(function(){
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  // serve static assets normally
  app.use(express.static(path.resolve(__dirname, '..', 'client')));
}());


//SERVER IN MEMORY STORAGE FOR GAME STATE MANAGEMENT & CHAT
let players = [];

//Initiate Socket with all functions for server
io.on('connection', (socket) => {
  console.log('a user connected with socketID', socket.id);
  // emit player update to specific socket

  //TODO: Call function that attaches all functions to socket
  socket.on('disconnect', () => {
    console.log('a user disconnected with socketID', socket.id);
    handleLobbyerLeave(socket);
  })

  socket.on('lobbyerJoinLobby', (lobbyObj) => {
    //TODO: Customize Player Obj for server purposes
    lobbyObj.socketId = socket.id;
    let state = store.getState();
    lobbyObj.playerNumber = state.lobby.lobbyers.length + 1;
    lobbyObj.host = lobbyObj.playerNumber === 1 ? true : false;
    lobbyObj.gunLvl = 1;
    store.dispatch(receiveJoinLobby(lobbyObj));
    state = store.getState();
    io.emit('lobbyUpdate', state.lobby.lobbyers);
  });

  socket.on('lobbyerLeaveLobby', () => {
    handleLobbyerLeave(socket);
    //if game is playing, tell that socket to destroy its sprite;
    let state = store.getState();
    if (state.game.gamePlaying){
      socket.emit('destroyCurrentPlayerSprite');
      io.emit('playerLeaveGame', socket.id);
    }
  });

  socket.on('getGameState', () => {
    let state = store.getState();
    socket.emit('gamePlayingUpdate', state.game.gamePlaying);
  })

  socket.on('upgradeGun', (gunLvl) => {
    store.dispatch(upgradeGun(gunLvl, socket.id));
    state = store.getState();
    io.emit('lobbyUpdate', state.lobby.lobbyers);
  })

  socket.on('getLobby', () => {
    //emit lobby state
    //NOTE: NOT IMPLEMENTED
    let state = store.getState();
    socket.emit('lobbyUpdate', state.lobby.lobbyers);
  })

  socket.on('newChatMessage', (msgObjFromClient) => {
    //emit message
    //dispatch new message to chat
    io.emit('messagesUpdate', msgObjFromClient);
  })

  socket.on('gameIsStarting', () => {
    startGame(io);
    console.log('state at start of game: ', store.getState());
  });

  socket.on('clientUpdate', (clientState) => {
    //TODO: break state down and dispatch to appropriate reducers
    // console.log('server heard client update with: ', playerState);
    // console.log('this client told the server to update: ', socket.id);/
    let zombies = clientState.zombies;
    let playerState = clientState.player;
    if (store.getState().game.gamePlaying !== true){
      console.log('server received this but is rejecting it :', clientState);
      return;
    }
    // console.log('server received player: ', clientState.player);
    store.dispatch(updatePlayer(playerState));
    store.dispatch(updateZombiesFromClient(playerState.socketId, zombies));
    if (clientState.logs) {
      store.dispatch(updateLogsFromClient(socket.id, clientState.logs));
    }
    // console.log('received zombies: ', zombies);
  });

  socket.on('endOfGame', () => {
    // if (!state.game.gamePlaying){
    //   return;
    // }
    endGame();
    let state = store.getState();
    console.log('STATE AT END OF GAME: ', state);
  })

})


//create functions for sockets
function findPlayer(socketId){
  return R.findIndex(R.propEq('socketId', socketId))(players);
}

function handleLobbyerLeave(socket){
  let state = store.getState();
  let userWhoLeft = state.lobby.lobbyers.filter(lobbyer => lobbyer.socketId === socket.id)[0];
  if (userWhoLeft){
    store.dispatch(receiveLobbyerLeave(userWhoLeft.socketId));
    state = store.getState();
    io.emit('lobbyUpdate', state.lobby.lobbyers);
    store.dispatch(removePlayer(socket.id));
    if (state.game.gamePlaying){
      io.emit('playerLeaveGame', socket.id);
      state = store.getState();
      socket.emit('destroyCurrentPlayerSprite');
    }
  }
}

// handle every other route with index.html, which will contain
// a script tag to our application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
})
