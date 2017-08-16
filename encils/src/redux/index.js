/**
* create-react-app-intro
* Redux reducer index file
* author: @
*/
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form'

const initialState = {
  auth_token: '',
  classroom: {},
  classrooms: [],
  classroomStudents: [],
}

const apiReducer = (previousState = initialState, { key, form, data, type }) => {
  switch (type) {
    case 'API_SUCCESS':
      let newData = {}
      newData[key] = data
      console.log(newData);
      return Object.assign({}, previousState, newData)
    default:
      return previousState;
  }
}

export default combineReducers({
  apiReducer: apiReducer,
  routing: routerReducer,
  form: formReducer,
});