import axios from 'axios';
import R from 'ramda';


/* Action Types */
// const ADD_PLAYER = 'ADD_PLAYER';
const LOAD_PLAYERS = 'LOAD_PLAYERS';
const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER';
const SET_GAME_PLAYING_BOOL = 'SET_GAME_PLAYING_BOOL';
const UPDATE_PLAYER_SCORE = 'UPDATE_PLAYER_SCORE';
const UPDATE_PLAYERS = 'UPDATE_PLAYERS';
const UPDATE_CURRENT_PLAYER = 'UPDATE_CURRENT_PLAYER';
const PLAYER_LEAVE_GAME = 'PLAYER_LEAVE_GAME';

/* Action Creators */
export const loadMessage = message => ({ type: CHANGE_MESSAGE, message });
// export const addPlayer = player => ({type: ADD_PLAYER, player});
export const loadPlayers = allPlayers => ({type: LOAD_PLAYERS, allPlayers})
export const setCurrentPlayer = player => ({type: SET_CURRENT_PLAYER, player});
export const changeGamePlaying = gameStatus => ({type: SET_GAME_PLAYING_BOOL, gameStatus});
export const changePlayerScore = (socketId, newScore) => ({type: UPDATE_PLAYER_SCORE, id: socketId, newScore: newScore})
export const updatePlayers = serverPlayersState => ({
  type: UPDATE_PLAYERS,
  players: serverPlayersState
})
export const updateCurrentPlayer = currentPlayerState => ({
  type: UPDATE_CURRENT_PLAYER,
  currentPlayerState
});
export const playerLeaveGame = playerSocketId => ({
  type: PLAYER_LEAVE_GAME,
  id: playerSocketId
});

//Note: addPlayer can probably be removed from file but will keep for now in case we change structure
const initialState = {
  playerStates: {},
  currentPlayer: {}
};

/* Reducer */
let allPlayers;
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case LOAD_PLAYERS:
      newState.allPlayers = action.allPlayers;
      ZG.players = newState.allPlayers;
      break;

    case SET_CURRENT_PLAYER:
      newState.currentPlayer = action.player;
      break;

    case SET_GAME_PLAYING_BOOL:
      newState.gamePlaying = action.gameStatus;
      break;

    case UPDATE_PLAYER_SCORE:
      let indexToUpdate = findPlayer(action.id);
      console.log('updating player at ', newState.allPlayers[indexToUpdate], 'to: ', action.newScore);
      newState.allPlayers[indexToUpdate].score = action.newScore;
      break;

    case UPDATE_PLAYERS:
      console.log('PLAYERS GOT FROM SERVER: ', action.players);
      newState.playerStates = action.players;
      break;

    case UPDATE_CURRENT_PLAYER:
      newState.currentPlayer = action.currentPlayerState;
      break;

    case PLAYER_LEAVE_GAME:
      newState.playerStates = newState.playerStates.filter( (playerState) =>
        playerState.socketId !== action.id);
      break;

    default:
      return state;
  }

  allPlayers = newState.allPlayers;
  return newState;
};



/* Action Dispatchers */
export const fetchPlayers = () => dispatch => {
  return axios.get('/players')
  .then(response => response.data)
  .then(players => dispatch(loadPlayers(players)))
};

/* Reference - old post route for creating new players
  export const createNewPlayer = (player) => {
    console.log('createNewPlayer is sending: ', player);
    axios.post('/player', player);
  }; */
function findPlayer(socketId){
  return R.findIndex(R.propEq('socketId', socketId))(allPlayers);
}
