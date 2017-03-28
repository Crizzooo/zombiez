import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from '../components/Header';

import Leaderboard from '../components/Leaderboard';
import GameContainer from './gameContainer.jsx';

class Layout extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render () {
    return (
      <div className="siteContainer">
        <div className="gc">
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
