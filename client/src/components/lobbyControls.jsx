import React from 'react';
import { connect } from 'react-redux';
import store from '../store.js';
import { dispatchSetCurrentLobbyer } from '../reducers/lobby-reducer.js';
import { updateCurrentPlayer, removeCurrentPlayer } from '../reducers/players-reducer.js';
import { stopClientBroadcast } from '../engine/emitCurrentState.js';

export class lobbyControls extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      score: 0
    };
    this.handleLeaveGame = this.handleLeaveGame.bind(this);
  }

  handleLeaveGame(evt) {
    //stop broadcasting (was causing ghost players)
    socket.emit('lobbyerLeaveLobby');
    stopClientBroadcast();
    store.dispatch(dispatchSetCurrentLobbyer({}));
    //if game playing
      //update current player to {}
    store.dispatch(removeCurrentPlayer());
  }

  componentDidMount() {
    $('#addPlayerModal').on('shown.bs.modal', function () {
      $('#playerNameInput').focus()
    });
  }

  render() {

    let joinGameButton = renderJoinGameButton(this.props, this.handleLeaveGame);

    return (
      <div id="joinButtonHolder">
        {
          /* check if current player or not */
          //render join game if no current player
          //if no game in Progress
          //if player length not less than 4
          joinGameButton

        }
      </div>
    );
  }
}

const mapProps = state => {
  console.log('state in map props of lobby control: ', state)
  return {
  currentLobbyer: state.lobby.currentLobbyer,
  lobbyers: state.lobby.lobbyers,
  gamePlaying: state.game.gamePlaying
};};

export default connect(mapProps)(lobbyControls);


function renderNormalJoinGame(){
  return (
    <div>
      <button type="button" id="joinGame" className="btn btn-lg btn-info btn-danger btn-sm btn-block" data-target="#addPlayerModal" data-toggle="modal"><span className="playBtnText">Join Game!</span>
      </button>
    </div>
  );
}

function renderFullJoinGame(){
  return(
    <div>
      <button type="button" id="joinGame" className="btn btn-lg btn-danger btn-sm btn-block" disabled><span className="playBtnText">Game Is Full!</span></button>
    </div>
  );
}

function renderGameInProgress(){
  return(
    <div>
      <button type="button" id="joinGame" className="btn btn-lg btn-info btn-info btn-sm btn-block" disabled><span className="playBtnText">Game In Progress!</span></button>
    </div>
  );
}

function renderLeaveGame(leaveGameFunc, buttonLabel){
  return(
    <div>
      <button type="button" id="joinGame" className="btn btn-lg btn-info btn-warning btn-sm btn-block" onClick={leaveGameFunc}><span className="playBtnText">{buttonLabel}</span></button>
    </div>
  );
}

function renderJoinGameButton(props, handleLeaveGame){
  let jsxButton;
  if (props.gamePlaying){
    //render game in progress button
    if (props.currentLobbyer.name) {
      jsxButton = renderLeaveGame(handleLeaveGame, 'Quit Game!');
    } else {
      jsxButton = renderGameInProgress();
    }
  } else if (props.lobbyers && props.lobbyers.length >= 4 && !props.currentLobbyer.name) {
    //render game full
    jsxButton = renderFullJoinGame();
  } else if (props.currentLobbyer.name) {
      //render leave game button
      jsxButton = renderLeaveGame(handleLeaveGame, 'Leave Lobby!');
  } else {
    //no current lobbyer, and lobby is not full
    jsxButton = renderNormalJoinGame();
  }
  return jsxButton;
}
