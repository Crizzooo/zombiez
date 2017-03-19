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

const {addPlayer, updatePlayer, removePlayer} = require('./reducers/players.js');

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
let messages = [];

let clientStates = {};
const throttledStateChange = throttle(emitStateChange, 32);

//Initiate Socket with all functions for server
io.on('connection', (socket) => {
  console.log('a user connected with socketID', socket.id);
  // emit player update to specific socket

  //TODO: Call function that attaches all functions to socket
  socket.on('disconnect', () => {
    let state = store.getState();
    console.log('a user has left the lobby with socketId:', socket.id);
    let userWhoLeft = state.lobby.lobbyers.filter(lobbyer =>
      lobbyer.socketId === socket.id
    )[0];
    if (userWhoLeft) {
      store.dispatch(receivePlayerLeave(userWhoLeft));
      state = store.getState();
      console.log('lobbyers after: ', state.lobby.lobbyers);
      socket.emit('currentLobbyer', {});
      io.emit('lobbyUpdate', state.lobby.lobbyers);
      //IF GAME IS PLAYING
      if (state.game.gamePlaying){
        store.dispatch(removePlayer(socket.id));
        //emit 'removePlayer'
        io.emit('playerLeaveGame', socket.id);
      }
    }
  })

  socket.on('lobbyerJoinLobby', (lobbyObj) => {
    //TODO: Customize Player Obj for server purposes
    // Send back new player obj
    lobbyObj.socketId = socket.id;
    console.log('sending lobbyObj to server reducer', lobbyObj);
    store.dispatch(receivePlayerJoin(lobbyObj));
    let state = store.getState();
    console.log('this is the state im sending back: ', state);
    io.emit('lobbyUpdate', state.lobby.lobbyers)

    socket.emit('currentLobbyer', state.lobby.lobbyers[state.lobby.lobbyers.length - 1]);
  });

  socket.on('lobbyerLeaveLobby', (currentLobbyer) => {
    let state = store.getState();
    console.log('a user has left the lobby with socketId:', socket.id);
    //TODO: remove socket from players array
    console.log('lobbyers before:', state.lobby.lobbyers);

    store.dispatch(receivePlayerLeave(currentLobbyer));

    //let lobbyers = R.filter( (lobbyer) => lobbyer.socketId !== socket.id, state.lobby.lobbyers);
    state = store.getState();
    console.log('lobbyers after: ', state.lobby.lobbyers);
    socket.emit('currentLobbyer', {});
    io.emit('lobbyUpdate', state.lobby.lobbyers);
    //TODO: check if game is in progress
    if (state.game.isPlaying) {
      store.dispatch(removePlayer(socket.id));
      io.emit('playerLeaveGame', socket.id);
    }
  });

  socket.on('getLobby', () => {
    //emit lobby state
    //NOTE: NOT IMPLEMENTED
    console.log(store);
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

  socket.on('playerEnterGame', (playerState) => {
      //dispatch player to players reducers
      console.log('player state', playerState);
      store.dispatch(addPlayer(playerState));
      let state = store.getState();
  });



//revisit below socket methods
  socket.on('getPlayers', () => {
    //emiting player.state
    socket.emit('playerUpdate', players);
  })


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

  socket.on('playerScored', (playerId, score) => {
    io.emit('updateLeaderboard', playerId, score);
  })

  socket.on('clientUpdate', (state) => {
    //TODO: break state down and dispatch to appropriate reducers
    store.dispatch(addPlayer(state.player));
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

// handle every other route with index.html, which will contain
// a script tag to our application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
})
