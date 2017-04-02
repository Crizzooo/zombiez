import {expect} from 'chai';
import {createStore} from 'redux';
import {engineReducers, resetEngine, gamePlaying} from '../server/reducers/engine.js';
import {lobby, receiveJoinLobby, receiveLobbyerLeave, resetLobby, upgradeGun} from '../server/reducers/lobby.js';
import {updateLogsFromClient, logsReducer, dispatchLogReset} from '../server/reducers/logs.js';
import { playerReducers, removePlayer, receiveClientData, resetPlayers, addPlayer, updatePlayer } from '../server/reducers/players.js'
describe('Redux store on the server', () => {
  describe('game engine', () => {
    let testStore;

    beforeEach('create a testing store', () => {
      testStore = createStore(engineReducers);
    });

    it('starts with the game engine set to false', () => {
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({gamePlaying: false});
    });

    it('can start the game by calling gamePlaying', () => {
      testStore.dispatch(gamePlaying(true));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({gamePlaying: true});
    });
    it('resetting it will return it to false', () => {
      testStore.dispatch(gamePlaying(true));
      testStore.dispatch(resetEngine());
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({gamePlaying: false});
    })
  })

  describe('lobby', () => {
    let testStore;
    beforeEach('create a testing store', () => {
      testStore = createStore(lobby);
    });

    it('starts with empty lobbyers and messages', () => {
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({
        lobbyers: [],
        messages: []
      });
    })

    it('adding a lobbyer adds it to the lobbyer array', () => {
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 123, user: 'testPerson' }));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({
          "lobbyers": [
            {
              "gunLvl": 1,
              "user": "testPerson",
              "socketId": 123
            }
          ],
          "messages": []
        }
      );
    })
    it('adding another lobbyer adds it to the lobbyer array', () => {
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 123, user: 'testPerson' }));
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 456, user: 'theBettertest' })
      );
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({
          "lobbyers": [
            {
              "gunLvl": 1,
              "user": "testPerson",
              "socketId": 123
            },
            {
              "gunLvl": 1,
              "user": "theBettertest",
              "socketId": 456
            }
          ],
          "messages": []
        }
      );
    })
    it('a player leaving results in it being deleted from the lobbyer array', () => {
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 123, user: 'testPerson' }));
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 456, user: 'theBettertest' })
      );
      testStore.dispatch(receiveLobbyerLeave(123));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({
          "lobbyers": [
            {
              "gunLvl": 1,
              "user": "theBettertest",
              "socketId": 456
            }
          ],
          "messages": []
        }
      );
    })
    it('resetting the lobby results in the lobbyer array being empty', () => {
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 123, user: 'testPerson' }));
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 456, user: 'theBettertest' }));
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 666, user: 'another one' }));
      testStore.dispatch(receiveJoinLobby({ gunLvl: 1, socketId: 939, user: 'and another one' }));
      testStore.dispatch(resetLobby());
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({
        lobbyers: [],
        messages: []
      });
    })
  })

  describe('logs', () => {
    let testStore;
    beforeEach('create a testing store', () => {
      testStore = createStore(logsReducer);
    });

    it('starts with the logs set to an empty object', () => {
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({serverLogs: {}});
    });
    it('adds logs from specific players through update', () => {
      testStore.dispatch(updateLogsFromClient(123, ['player 1 has picked up a health pack', 'player 1 has fallen asleep']));
      testStore.dispatch(updateLogsFromClient(456, ['player 2 has picked up a speed pack', 'player 2 has stolen player 1s lunch']));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({serverLogs: {
        '123': ['player 1 has picked up a health pack', 'player 1 has fallen asleep'],
        '456': ['player 2 has picked up a speed pack', 'player 2 has stolen player 1s lunch']
      }
      })
    })
    it('resetting the logs sets the state back to an empty object', () => {
      testStore.dispatch(updateLogsFromClient(123, ['player 1 has picked up a health pack', 'player 1 has fallen asleep']));
      testStore.dispatch(updateLogsFromClient(456, ['player 2 has picked up a speed pack', 'player 2 has stolen player 1s lunch']));
      testStore.dispatch(dispatchLogReset());
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({serverLogs: {}});
    })
  })

  describe('players', () => {
    let testStore;
    beforeEach('create a testing store', () => {
      testStore = createStore(playerReducers);
    });

    it('starts the players as an object with empty playerStates and playerHealths', () => {
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({ playerStates: {}, playerHealths: {} });
    })

    it('adding a player must take in a playerState to be added', () => {
      testStore.dispatch(addPlayer({name: 'player 1', socketId: 123}));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({playerHealths: {}, playerStates: {
        "123": {
          "name": "player 1",
          "socketId": 123
        }
      }});
    })

    it('adding a second player will have both players on the state', () => {
      testStore.dispatch(addPlayer({name: 'player 1', socketId: 123}));
      testStore.dispatch(addPlayer({name: 'player 2', socketId: 456}));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({playerHealths: {}, playerStates: {
        "123": {
          "name": "player 1",
          "socketId": 123
        },
        "456": {
          "name": "player 2",
          "socketId": 456
        }
      }});
    })
    it('updates a single player by their socketId', () => {
      testStore.dispatch(addPlayer({name: 'player 1', socketId: 123}));
      testStore.dispatch(addPlayer({name: 'player 2', socketId: 456}));
      testStore.dispatch(updatePlayer({name: 'The Best Player', socketId: 123}));
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({playerHealths: {}, playerStates: {
        "123": {
          "name": "The Best Player",
          "socketId": 123
        },
        "456": {
          "name": "player 2",
          "socketId": 456
        }
      }});
    })
    it('resetting the player lobby sets the store back to the initial state',() => {
      testStore.dispatch(addPlayer({name: 'player 1', socketId: 123}));
      testStore.dispatch(addPlayer({name: 'player 2', socketId: 456}));
      testStore.dispatch(resetPlayers());
      let currentState = testStore.getState();
      expect(currentState).to.deep.equal({ playerStates: {}, playerHealths: {} });
    })
  })
})