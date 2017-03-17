import React from 'react';
import { connect } from 'react-redux'

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
    socket.emit('playerJoinLobby', this.state);
    $('#addPlayerModal').modal('hide');
    $('#playerNameInput').val('');
  }

  handleLeaveGame(evt) {
    socket.emit('playerLeaveLobby', this.props.currentLobbyer);
  }

  componentDidMount() {
    $('#addPlayerModal').on('shown.bs.modal', function () {
      $('#playerNameInput').focus()
    });
  }

  render() {
    console.log('Current Lobbyer:', this.props.currentLobbyer);

    return (
      <div id="buttonHolder">
        {
          /* check if current player or not */
          this.props.lobbyers && this.props.lobbyers.length < 4 && !this.props.currentLobbyer.name ?
            <button type="button" className="btn btn-lg btn-info btn-danger btn-sm btn-block" data-target="#addPlayerModal" data-toggle="modal"><span className="playBtnText">Join Game!</span></button>
            :
            <div>
              <button type="button" className="btn btn-lg btn-info btn-warning btn-sm btn-block" onClick={this.handleLeaveGame}><span className="playBtnText">Leave Game!</span></button>
              {this.props.lobbyers.length === 4 ?
              <h6>Maximum player count reached!</h6>
              :
              null
              }
            </div>
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
  /*players: state.players.allPlayers,
  currentLobbyer: state.players.currentLobbyer */
  currentLobbyer: state.lobby.currentLobbyer,
  lobbyers: state.lobby.lobbyers
});

export default connect(mapProps)(lobbyControls);
