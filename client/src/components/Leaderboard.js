import React from 'react';
import { connect } from 'react-redux'
import LobbyControls from './lobbyControls';
import ChatApp from './chatApp.jsx';

function Leaderboard(props) {
  let lobbyers = props.lobbyers ? props.lobbyers.sort((a, b) => b.score - a.score) : [];
  let playerRows = [];
  //loop through player count - create player objects
  let livePlayers = lobbyers.map( (player, index) => {
    return (<tr key={'player' + (index + 1)}>
      <th scope="row">{1 + index}</th>
      <td>{player.name}</td>
      <td>{player.gunLvl}</td>
    </tr>);
  })
  playerRows.push(...livePlayers);

  const livePlayerCount = livePlayers.length;
  for ( var i = 4 - livePlayerCount; i > 0; i--){
    playerRows.push( (<tr key={'player' + (playerRows.length + 1)}>
      <th scope="row">{playerRows.length + 1}</th>
      <td>Joinable Slot!</td>
      <td>--</td>
    </tr>))
  }

  //4 - player count times, create empty rows
  return (
    <div className="row" id="mainRow">
      <div className="leaderboard">
        <LobbyControls />
        <table className="table table-striped table-inverse table-hover">
          <thead className="thead-inverse">
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Gun Level</th>
            </tr>
          </thead>
          <tbody>
            {
              playerRows && playerRows.map((playerElement, index) => {
                return playerElement;
              })
            }
          </tbody>
        </table>
      </div>
      <div className="chatContainer">
        <ChatApp />
      </div>
    </div>
  )
}

const mapState = state => {
  return {
    lobbyers: state.lobby.lobbyers
  };
};

export default connect(mapState, null)(Leaderboard)
