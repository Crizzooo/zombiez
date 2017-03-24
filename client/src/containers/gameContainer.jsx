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
        if(this.props.currentPlayer.name) {
          console.log('game not playing, and we have current player');
          return(
              <div className="gameContainer"><div className="buttonHolder"><button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame}><span className="playBtnText">Play Game!</span></button></div></div>
          );
        } else {
          console.log('game not playing, and we have no player');
          return (<div className="gameContainer"><div className="buttonHolder"><button type="button" className="btn btn-lg btn-info playButton" onClick={this.startGame} disabled><span className="playBtnText">Play Game!</span></button><div className="minPlayerText">Require Minimum Players: 1</div></div></div>);
        }
      } else {
        //Game is Currently Playing
        console.log('game playing, rendering game component');
        return (
          <div className="gameContainer">
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
