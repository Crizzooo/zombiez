import axios from 'axios'

const initialState = {
  allMessages: []
};

/* Reducer */
export default (state = initialState, action) => {

  const newState = Object.assign({}, state);

  switch (action.type) {

    case LOAD_MESSAGES:
      newState.allMessages = action.allMessages;
      break;

    case ADD_MESSAGE:
      newState.allMessages = [...newState.allMessages, action.message];
      break;

    default:
      return state;
  }
  return newState
};

/* Action Types */
const LOAD_MESSAGES = 'LOAD_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';

/* Action Creators */
export const loadMessages = allMessages => ({ type: LOAD_MESSAGES, allMessages });
export const addMessage = message => ({ type: ADD_MESSAGE, message });

/* Action Dispatchers */

/* - Reference - example dispatch function
  export const fetchPlayers = () => dispatch => {
    return axios.get('/players')
    .then(response => response.data)
    .then(players => dispatch(loadPlayers(players)))
  }; */
