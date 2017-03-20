const { createStore, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;
const createLogger = require('redux-logger');

//reducers
const mainReducer = require('./reducers/index.js');

module.exports = createStore( mainReducer, applyMiddleware(thunk));
