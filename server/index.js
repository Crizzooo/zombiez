const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const R = require('ramda');
const throttle = require('lodash.throttle');

const store = require('./store.js');
//Store Dispatchers
const receivePlayerJoin = require('./reducers/lobby.js').receiveJoinLobby;
const receivePlayerLeave = require('./reducers/lobby.js').receivePlayerLeave;




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
let messages = [];

let clientStates = {};
const throttledStateChange = throttle(emitStateChange, 32);

//Initiate Socket with all functions for server
io.on('connection', (socket) => {
  console.log('a user connected with socketID', socket.id);
  // emit player update to specific socket

  //TODO: Call function that attaches all functions to socket
  socket.on('disconnect', () => {
    console.log('a user has disconnected with socketId:', socket.id);
    //TODO: remove socket from players array
    players = R.filter( (player) => player.socketId !== socket.id, players);
    io.emit('playerUpdate', players);
  });

  socket.on('playerJoinLobby', (lobbyObj) => {
    //TODO: Customize Player Obj for server purposes
    // Send back new player obj
    lobbyObj.socketId = socket.id;
    /* LobbyObj {
        name: 'Chris',
        score: 0,
        socketId: 12301230
    } */
    //dispatch to player reducer the player obj
    console.log('sending lobbyObj to server reducer', lobbyObj);
    store.dispatch(receivePlayerJoin(lobbyObj));
    let state = store.getState();
    console.log('this is the state im sending back: ', state);
    io.emit('lobbyUpdate', state.lobby.lobbyers)

    socket.emit('currentPlayer', state.lobby.lobbyers[state.lobby.lobbyers.length - 1]);
    /* OLD CODE -- NOTE: COME BACK TO MAKE SURE CLIENTS GET UPDATED LOBBY STATE
    //tell client their playerObj
    socket.emit('currentPlayer', playerObj);
    //tell other clients about new player
    io.emit('playerUpdate', players); */
  });

  socket.on('playerLeaveLobby', (currentLobbyer) => {
    let state = store.getState();
    console.log('a user has left the lobby with socketId:', socket.id);
    //TODO: remove socket from players array
    console.log('lobbyers before:', state.lobby.lobbyers);

    store.dispatch(receivePlayerLeave(currentLobbyer));

    //let lobbyers = R.filter( (lobbyer) => lobbyer.socketId !== socket.id, state.lobby.lobbyers);
    state = store.getState();
    console.log('lobbyers after: ', state.lobby.lobbyers);
    socket.emit('currentPlayer', {});
    io.emit('lobbyUpdate', state.lobby.lobbyers);
  });

  socket.on('disconnect', () => {
    let state = store.getState();
    console.log('a user has left the lobby with socketId:', socket.id);
    let userWhoLeft = state.lobby.lobbyers.filter(lobbyer =>
      lobbyer.socketId === socket.id
    )[0];
    store.dispatch(receivePlayerLeave(userWhoLeft));
    state = store.getState();
    console.log('lobbyers after: ', state.lobby.lobbyers);
    socket.emit('currentPlayer', {});
    io.emit('lobbyUpdate', state.lobby.lobbyers);
  })

  socket.on('getPlayers', () => {
    //emiting player.state
    socket.emit('playerUpdate', players);
  })

  socket.on('getLobby', () => {
    //emit lobby state
    //NOTE: NOT IMPLEMENTED
    console.log(store);
    let state = store.getState();
    socket.emit('lobbyUpdate', state.lobby.lobbyers);
  })

  //TODO: emit all the messages in the array
  //TODO: listen for new messages coming in and emit all the messages
  socket.on('newChatMessage', (msgObjFromClient) => {
    //emit message
    //dispatch new message to chat
    io.emit('messagesUpdate', msgObjFromClient);
  })

  socket.on('gameIsStarting', (players) => {
    io.emit('turnOnGameComponent');
    clientStates = {};
    let startDate = new Date();
    io.emit('startGame', players, startDate);
  })

  const throttledStateChange = throttle(emitStateChange, 32);
  socket.on('playerMoving', (playerObj) => {
    // console.log('receive player?', playerObj);
    // console.log('current server players state:', players);
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

  socket.on('fireIceBall', (x, y, velocity, direction, senderSocketId) => {
    console.log('server telling clients to create iceball:', x, y, velocity, senderSocketId);
    io.emit('createIceBall', x, y, velocity, direction, senderSocketId);
  });

  socket.on('playerScored', (playerId, score) => {
    io.emit('updateLeaderboard', playerId, score);
  })

  socket.on('clientUpdate', (state) => {
    console.log('Server recieved: ', state);

    //package client states
    clientStates[state.playerId] = {
      x: state.x,
      y: state.y,
      gameTime: state.gameTime,
      id: state.playerId
    };

    //emit state holding each client state
    throttledStateChange();
  });
})


// function throttledStateChange() {
//   return throttle(emitStateChange, 5);
// }


//create functions for sockets
function findPlayer(socketId){
  return R.findIndex(R.propEq('socketId', socketId))(players);
}

function emitStateChange(){
  console.log('emitting players:', clientStates);
  io.emit('serverUpdate', clientStates);
}




// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
})
