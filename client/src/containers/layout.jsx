import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store.js'
import Header from '../components/Header';
import { dispatchSetCurrentLobbyer } from '../reducers/lobby-reducer.js';

import Leaderboard from '../components/Leaderboard';
import GameContainer from './gameContainer.jsx';

class Layout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.modalJSX =
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
  }

  handleChange(evt) {
    this.setState({ name: evt.target.value })
  }

  handleSubmit(evt) {
    evt.preventDefault();
    if (this.state.name.length < 1){
      this.state.name = 'I FORGOT TO PUT IN A NAME';
    }
    socket.emit('lobbyerJoinLobby', this.state);
    let currentLobbyer = this.state;
    currentLobbyer.socketId = socket.id;
    store.dispatch(dispatchSetCurrentLobbyer(currentLobbyer));
    $('#addPlayerModal').modal('hide');
    $('#playerNameInput').val('');
  }

  render () {
    return (
      <div className="siteContainer">
        <div className="gc">
          { this.modalJSX }
          <GameContainer />
          <div className="container mainContainer">
            <Leaderboard />
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

//map functions if needed, remove at end if not used
  // const mapProps = state => ({})
  // const mapDispatch = {}

export default connect()(Layout);
