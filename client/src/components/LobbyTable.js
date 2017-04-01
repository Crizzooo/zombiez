import React from 'react';
import { connect } from 'react-redux'
import LobbyControls from './lobbyControls';
import ChatApp from './chatApp.jsx';


//TODO: fucntion for joining a lobby

class LobbyTable extends React.Component {
  //loop through lobby count - create player objects
  constructor(props) {
    console.log('props: ', props);
    super(props);


    this.lobbies = this.props.lobbies;
    this.lobbyRows = [];
    this.state = {
      lobbyName: ''
    }
    this.createModal = this.createModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    //create active lobbies
    let activeLobbies = this.props.lobbies.map( (lobby) => {
      if(lobby.playerCount < 4){
        return (
          (<tr className="lobbyTableRow">
          <td scope="row" className="lobbyName col-md-6">{lobby.name + ' ' + lobby.playerCount +
          ' / 4'}</td>
          <td className="col-md-6"><button className="button btn-danger btn-sm joinLobbyButton">Join Lobby!</button></td>
          </tr>)
        );
      } else {
        return (
          (<tr className="lobbyTableRow">
          <td scope="row" className="lobbyName col-md-6">{lobby.name + ' ' + lobby.playerCount +
          ' / 4'}</td>
          <td className="col-md-6"><button className="button btn btn-sm joinLobbyButton" disabled>Lobby Full!</button></td>
          </tr>)
        );
      }
    });

    //create empty lobbies
    let emptyLobbies = this.createEmptyLobbies(activeLobbies.length);

    this.lobbyRows.push(activeLobbies);
    this.lobbyRows.push(emptyLobbies);

    this.modalJSX = this.createModal();
    console.log('got modal JSX', this.modalJSX);

    $('#createLobbyModal').on('shown.bs.modal', function () {
      $('#lobbyNameInput').focus()
    });

    console.log('lobby table received this.props: ', this.props);
  }

  render () {
    return (
      <div>
      { this.modalJSX }
      <div className="lobbyTableHolder">
      <div className="lobbyTable">
      <table className="table table-hover table-inverse text-center lobbies">
      <tbody>
      {
        this.lobbyRows && this.lobbyRows.map((lobbyRowElement) => {
          return lobbyRowElement;
        })
      }
      </tbody>
      </table>
      </div>
      </div>
      </div>
    )
  }


  handleChange(evt){
    this.setState({ lobbyName: evt.target.value });
  }

  handleSubmit(evt){
    evt.preventDefault();
    console.log('ill get back to this: ', this.state.lobbyName);
    $('#lobbyNameInput').val("");
  }

  createEmptyLobbies(activeLobbyCount) {
    let emptyLobbyAmount = 10 - activeLobbyCount;
    let emptyLobbies = [];
    for (var i = 0; i < emptyLobbyAmount; i++){
      if (i === 0){
        emptyLobbies.push(
            (<tr className="lobbyTableRow">
            <td scope="row" className="lobbyName col-md-6"> -- Empty Lobby --</td>
            <td className="col-md-6"><button className="button btn-info btn-sm joinLobbyButton"
            data-target="#createLobbyModal"
            data-toggle="modal">Create Lobby!</button></td>
            </tr>)
          );
      } else {
        emptyLobbies.push(
            (<tr className="lobbyTableRow">
            <td scope="row" className="lobbyName col-md-6">-- Empty Lobby --</td>
            <td className="col-md-6"><button className="button btn-info btn-sm joinLobbyButton" disabled>Create Lobby!</button></td>
            </tr>)
        );
      }
    }
    return emptyLobbies;
  }

  createModal(){
    return (
      <div className="modal fade" id="createLobbyModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Lobby Creation</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" onChange={this.handleChange} className="form-control" id="lobbyNameInput" aria-describedby="namePlayer" placeholder="insert desired lobby name here" autoFocus />
              </div>
              <button type="submit" className="btn btn-danger">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    )
  }


}


const mapState = state => {
  return {
      lobbies: state.lobbies.lobbies
  };
};

export default connect(mapState, null)(LobbyTable)
