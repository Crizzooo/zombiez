const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const R = require('ramda');
const throttle = require('lodash.throttle');

//Import Store
const store = require('./store.js');

//Store Dispatchers
const {receiveJoinLobby, receiveLobbyerLeave} = require('./reducers/lobby.js');
const {updatePlayer, removePlayer} = require('./reducers/players.js');

//Import helper functions
const startGame = require('./engine/updateClientLoop.js').startGame;


const server = app.listen(3000, () => {
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

let clientStates = {};
const throttledStateChange = throttle(emitStateChange, 32);

//Initiate Socket with all functions for server
io.on('connection', (socket) => {
  console.log('a user connected with socketID', socket.id);
  // emit player update to specific socket

  //TODO: Call function that attaches all functions to socket
  socket.on('disconnect', () => {
    handleLobbyerLeave(socket);
  })

  socket.on('lobbyerJoinLobby', (lobbyObj) => {
    //TODO: Customize Player Obj for server purposes
    // Send back new player obj
    lobbyObj.socketId = socket.id;
    console.log('sending lobbyObj to server reducer', lobbyObj);
    store.dispatch(receiveJoinLobby(lobbyObj));
    let state = store.getState();
    console.log('this is the state im sending back: ');
    console.dir(state, { depth: 3});
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
  });

  const throttledStateChange = throttle(emitStateChange, 32);

//No longer creating the player in the front end, so we no longer use this


//revisit below socket methods
  socket.on('getPlayers', () => {
    //emiting player.state
    socket.emit('playerUpdate', players);
  })


  socket.on('playerMoving', (playerObj) => {
    console.log('looking for ', playerObj);
    console.log('in ', players);
    var indexToUpdate = findPlayer(playerObj.socketId);
    console.log('findPlayer id:', indexToUpdate);

    console.log('does server make it here')
    var movingPlayer = players[indexToUpdate];
    if (!movingPlayer) {
      return;
    }
    console.log('WHAT ABOUT HERE');
    movingPlayer.x = playerObj.x;
    movingPlayer.y = playerObj.y;
    movingPlayer.velocityY = playerObj.velocityY;
    movingPlayer.velocityX = playerObj.velocityX;
    movingPlayer.dir = playerObj.dir;
    movingPlayer.socketId = playerObj.socketId;
    movingPlayer.hasMoved = true;
    console.log('sending updated player:', players[indexToUpdate]);
    // emitStateChange();
    throttledStateChange();
  });

  socket.on('playerScored', (playerId, score) => {
    io.emit('updateLeaderboard', playerId, score);
  })

  socket.on('clientUpdate', (state) => {
    //TODO: break state down and dispatch to appropriate reducers
    store.dispatch(updatePlayer(state.player));
  });
})


//create functions for sockets
function findPlayer(socketId){
  return R.findIndex(R.propEq('socketId', socketId))(players);
}

function emitStateChange(){
  console.log('emitting players:', clientStates);
  io.emit('serverUpdate', clientStates);
}

function handleLobbyerLeave(socket){
  let state = store.getState();
  console.log('preleave state: ', state);
  console.log('a user has left the lobby with socketId: ', socket.id)
  let userWhoLeft = state.lobby.lobbyers.filter(lobbyer => lobbyer.socketId === socket.id)[0];
  if (userWhoLeft){
    console.log('USER WHO WAS SUPPOSED TO LEAVE', userWhoLeft)
    store.dispatch(receiveLobbyerLeave(userWhoLeft.socketId));
    state = store.getState();
    console.log('after lobbyer leaves: ', state);
    io.emit('lobbyUpdate', state.lobby.lobbyers);
    console.log('at this point, lobby should not have player');
    console.log(state);
    if (state.game.gamePlaying){
      console.log('if game is playing, we need to take him off players reducer')
      io.emit('playerLeaveGame', socket.id);
      store.dispatch(removePlayer(socket.id));
      state = store.getState();
      console.log('has the player come off?', state);
    }
  }
}

// handle every other route with index.html, which will contain
// a script tag to our application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
})
