import React from 'react';
import {createStore} from 'redux';
import {range, last} from 'lodash';

import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
import {shallow} from 'enzyme';
import {spy} from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

// import LeaderBoard from '../client/src/components/Leaderboard';
// import ChatApp from '../client/src/components/chatApp';

describe('▒▒▒ React tests ▒▒▒', () => {

  describe('leader board component', () => {
    let leaderBoardWrapper;
    beforeEach('Create <LeaderBoard /> wrapper', () => {
      console.log("SHALLOW");
    });
    it('receives lobbyers from the application state', () => {
      console.log("THIS IS Chat", leaderBoardWrapper);
    })
  })

  describe('chat app component', () => {
    // beforeEach('Create <LeaderBoard /> wrapper', () => {
    //   messageData = {
    //     id: 5,
    //     from: {email: 'dan.sohval@fullstackacademy.com'},
    //     to: {email: 'ashi@gracehopperacademy.com'},
    //     subject: 'In re: curriculum updates',
    //     body: 'We should teach React!'
    //   };
    //   messageWrapper = shallow(<Message fullMessage={messageData}/>);
    // });

    it('receives props form application state', () => {

    })

    it('calls handleChange on change', () => {

    })

    it('changes the state of the component on change', () => {

    })

    it('Calls handleSubmit on submit', () => {

    })

    it('the users socket emits newChatMessage on submit', () => {

    })

  })

  describe('game container', () => {

  })

  describe('chat app', () => {

  })

  describe('chat app', () => {

  })



})