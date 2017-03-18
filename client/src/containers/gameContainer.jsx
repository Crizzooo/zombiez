import React, { Component } from 'react';
import { connect } from 'react-redux';


import { changeGamePlaying } from '../reducers/players-reducer.js';


class gameContainer extends Component {

  constructor(props) {
    super(props);
    this.startGame = this.startGame.bind(this);
  }

  render () {
    //TODO: REIMPLEMENT DISABLED ATTRIB ON FALSY RETURN AND PLAYERS <= 2
    if(this.props.gamePlaying === false){
      if(this.props.lobbyers && this.props.lobbyers.length >= 1) {
        return(
          <div className="col-md-6 gameContainer">
            <button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame}><span className="playBtnText">Play Game!</span></button>
          </div>
        );
      } else {
        return (<div className="col-md-6 gameContainer"><button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame} disabled><span className="playBtnText">Play Game!</span></button><h6>Require Minimum Players: 2</h6></div>);
      }
    } else {
      //Game is Currently Playing
      return (<div className="col-md-6 gameContainer">
        <div id="game">
        </div>
      </div>);
    }
  }

  startGame(players) {
  //Flip redux state for game = true
  socket.emit('gameIsStarting');
  }
}

const mapProps = state => {
  return {
    lobbyers: state.lobby.lobbyers,
    gamePlaying: state.game.gamePlaying,
    currentPlayer: state.lobby.currentLobbyer
  };
};

const mapDispatch = dispatch => ({
  changeGamePlayState: (gamePlayState) => {
    console.log('changing game play state to be', gamePlayState);
    dispatch(changeGamePlaying(gamePlayState));
  }
});

export default connect(mapProps, mapDispatch)(gameContainer);
