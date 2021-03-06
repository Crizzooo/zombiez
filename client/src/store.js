import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

//reducers
import clientReducer from './reducers/index.js';

const store = createStore(
  clientReducer,
  applyMiddleware(thunkMiddleware)
);

export default store;
