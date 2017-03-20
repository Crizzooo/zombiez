import React from 'react';
import { connect } from 'react-redux';
import store from '../store.js';
import { dispatchSetCurrentLobbyer } from '../reducers/lobby-reducer.js';
import { updateCurrentPlayer } from '../reducers/players-reducer.js';
import { stopClientBroadcast } from '../engine/emitCurrentState.js';

export class lobbyControls extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      score: 0
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLeaveGame = this.handleLeaveGame.bind(this);
  }

  handleChange(evt) {
    this.setState({ name: evt.target.value })
  }

  handleSubmit(evt) {
    evt.preventDefault();
    console.log('sending this player obj to server', this.state);
    socket.emit('lobbyerJoinLobby', this.state);
    $('#addPlayerModal').modal('hide');
    $('#playerNameInput').val('');
  }

  handleLeaveGame(evt) {
    //stop broadcasting (was causing ghost players)
    stopClientBroadcast();
    store.dispatch(dispatchSetCurrentLobbyer({}));
    //if game playing
    if (this.props.gamePlaying){
      //update current player to {}
      store.dispatch(updateCurrentPlayer({}));
    }
    socket.emit('lobbyerLeaveLobby');
  }

  componentDidMount() {
    $('#addPlayerModal').on('shown.bs.modal', function () {
      $('#playerNameInput').focus()
    });
  }

  render() {

    let joinGameButton = renderJoinGameButton(this.props, this.handleLeaveGame);

    return (
      <div id="buttonHolder">
        {
          /* check if current player or not */
          //render join game if no current player
          //if no game in Progress
          //if player length not less than 4
          joinGameButton

        }
        <div className="modal fade" id="addPlayerModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">New Player Creation</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={this.handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Name</label>
                    <input type="text" name="name" onChange={this.handleChange} className="form-control" id="playerNameInput" aria-describedby="namePlayer" placeholder="insert creative name here" autoFocus />
                    <small id="namePlayer" className="form-text text-muted">please dont feed the trolls</small>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapProps = state => ({
  currentLobbyer: state.lobby.currentLobbyer,
  lobbyers: state.lobby.lobbyers,
  gamePlaying: state.game.gamePlaying
});

export default connect(mapProps)(lobbyControls);


function renderNormalJoinGame(){
  return (
    <div>
      <button type="button" className="btn btn-lg btn-info btn-danger btn-sm btn-block" data-target="#addPlayerModal" data-toggle="modal"><span className="playBtnText">Join Game!</span>
      </button>
    </div>
  );
}

function renderFullJoinGame(){
  return(
    <div>
      <button type="button" className="btn btn-lg btn-danger btn-sm btn-block" disabled><span className="playBtnText">Game Is Full!</span></button>
    </div>
  );
}

function renderGameInProgress(){
  return(
    <div>
      <button type="button" className="btn btn-lg btn-info btn-info btn-sm btn-block" disabled><span className="playBtnText">Game In Progress!</span></button>
    </div>
  );
}

function renderLeaveGame(leaveGameFunc, buttonLabel){
  return(
    <div>
      <button type="button" className="btn btn-lg btn-info btn-warning btn-sm btn-block" onClick={leaveGameFunc}><span className="playBtnText">{buttonLabel}</span></button>
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
  } else if (props.lobbyers.length >= 4 && !props.currentLobbyer.name) {
    //render game full
    jsxButton = renderFullJoinGame();
  } else if ((props.lobbyers && props.lobbyers.length < 4) && !props.currentLobbyer.name){
      //no current Lobbyer, lobby length is small enough
      jsxButton = renderNormalJoinGame();
  } else if (props.currentLobbyer.name) {
      //render leave game button
      jsxButton = renderLeaveGame(handleLeaveGame, 'Leave Lobby!');
  }
  return jsxButton;
}
