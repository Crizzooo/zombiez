import React, { Component } from 'react';
import {Link} from 'react-router';

class ModeSelect extends Component {
    render(){
        console.log('in mode select render method');
        return (
          <div className="componentContainer">
            <div className="modeButtonHolder">
              <Link to="/multiplayer" >
                <button type="submit" className="btn btn-danger modeButtons selectMultiplayer">Multiplayer
                </button>
              </Link>
              <Link to="/singleplayer" >
                <button type="submit" className="btn btn-danger modeButtons selectSinglePlayer" disabled>Single Player</button>
              </Link>
            </div>
          </div>
                );
    }
}

export default ModeSelect;
