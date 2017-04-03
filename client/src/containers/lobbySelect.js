import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../store.js'
import Header from '../components/Header';
import LobbyTable from '../components/LobbyTable';
import { dispatchSetCurrentLobbyer } from '../reducers/lobby-reducer.js';

import Leaderboard from '../components/Leaderboard';
import GameContainer from './gameContainer.jsx';

class LobbyView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: ''
    }
  }

  componentWillMount(){
    socket.emit('getLobbies');
  }

  handleChange(evt) {
    this.setState({ name: evt.target.value })
  }

  handleSubmit(evt) {
    // evt.preventDefault();
    // if (this.state.name.length < 1){
    //   return;
    // }
    // socket.emit('lobbyerJoinLobby', this.state);
    // let currentLobbyer = this.state;
    // currentLobbyer.socketId = socket.id;
    // store.dispatch(dispatchSetCurrentLobbyer(currentLobbyer));
    // $('#addPlayerModal').modal('hide');
    // $('#playerNameInput').val('');
  }

  render () {
    return (
      <div className="siteContainer">
        <div className="gc">
          <div className="topContainer">
          </div>
          <div className="row">
            <div className="col-md-4">
            </div>
            <div className="col-md-4">
                <LobbyTable />
            </div>
            <div className="col-md-4">
            </div>
          </div>
        </div>
    </div>
    );
  }
}

//map functions if needed, remove at end if not used
  // const mapProps = state => ({})
  // const mapDispatch = {}

export default connect()(LobbyView);
