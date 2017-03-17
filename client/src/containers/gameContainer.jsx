import React, { Component } from 'react';
import { connect } from 'react-redux';


import { changeGamePlaying } from '../reducers/players-reducer.js';

import BootState from '../gameStates/boot.js';
import PreloadState from '../gameStates/preload.js';
import ZombieGameState from '../gameStates/zombieGameState.js';

//declare global variable for game

class gameContainer extends Component {

  constructor(props) {
    super(props);
    this.startGame = this.startGame.bind(this);
  }

  render () {
    //TODO: REIMPLEMENT DISABLED ATTRIB ON FALSY RETURN
    if(this.props.gamePlaying === false){
      if(this.props.players && this.props.players.length >= 2) {
        return(
          <div className="col-md-6 gameContainer">
            <button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame}><span className="playBtnText">Play Game!</span></button>
          </div>
        );
      } else {
        return (<div className="col-md-6 gameContainer"><button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame} ><span className="playBtnText">Play Game!</span></button><h6>Require Minimum Players: 2</h6></div>);
      }
    } else {
      //Game is Currently Playing
      console.log('There is a game going on!');
      return (<div className="col-md-6 gameContainer">
        <div id="game">
        </div>
      </div>);
    }
  }

  startGame(players) {
  //TODO: Remove elements in Game Container and replace with game
  //Flip redux state for game = true
  socket.emit('gameIsStarting', this.props.players)
  }
}

const mapProps = state => {
  return {
    lobbyers: state.lobby.lobbyers,
    gamePlaying: state.game.gamePlaying,
    currentPlayer: state.lobby.currentLobbyer
  };
};

/* Note on mapDispatch
  below is short-hand for mapDispatch, creates key w/ value of anonymous function
  that dispatches the function that was passed in*/

/* Reference - full way to write mapDispatch */
const mapDispatch = dispatch => ({
  changeGamePlayState: (gamePlayState) => {
    console.log('changing game play state to be', gamePlayState);
    dispatch(changeGamePlaying(gamePlayState));
  }
});

export default connect(mapProps, mapDispatch)(gameContainer);
