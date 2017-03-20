import axios from 'axios'


/* Action Types */
const LOAD_MESSAGES = 'LOAD_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';

/* Action Creators */
export const loadMessages = allMessages => ({ type: LOAD_MESSAGES, allMessages });
export const addMessage = message => ({ type: ADD_MESSAGE, message });

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
