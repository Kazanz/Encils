import fetch from 'isomorphic-fetch';
import Cookies from 'universal-cookie';
import isUndefined from 'lodash/isUndefined';
import { stopSubmit } from 'redux-form'
import {push} from 'react-router-redux';

import config from '../config/local';

const makeUrl = (endpoint) => { 
  return `http://${config.host}${endpoint}`
}

const request = (method, endpoint, key = null, formName = null) => (data = null) => (dispatch) => {
    let options = {
      'method': method,
      'headers': {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
    };

    if (data !== null) { options.body = JSON.stringify(data); }

    const cookies = new Cookies();
    const token = cookies.get("auth_token");
    if (token !== null) { options.headers.Authorization = token; }

    return fetch(makeUrl(endpoint), options).then((response) => {
      const statusCode = response.status.toString();
      if (statusCode === '200' || statusCode === '201') { 
        return response.json().then((resData) => { 
          if (!isUndefined(resData[key])) { 
            dispatch({ key, data: resData[key], type: 'API_SUCCESS'});
          } else {
            dispatch({ key, data: resData, type: 'API_SUCCESS'});
          }
          if (key === 'auth_token') {
            const newToken = `Token ${resData[key]}`;
            cookies.set(key, newToken);
          }
          return resData
        });
      } else if (statusCode === '204') {
        return response;
      } else if (statusCode === '401') {
          dispatch(push('/login'));
      } else if (statusCode.startsWith('4')) {
        return response.json().then((resData) => {
          dispatch(stopSubmit(formName, {_error: resData}));
        });
      } else {
        console.error(`Cannot handle HTTP code ${statusCode}!`);
      }
    });
}

const websocket = (endpoint, onMessage, onLogin) => {
    const cookies = new Cookies();
    const token = cookies.get("auth_token");
    const baseUrl = config.host;
    const ws = new WebSocket(`ws://${baseUrl}${endpoint}/?token=${token}`)
    ws.onmessage = ({ data }) => { 
      data = JSON.parse(data);
      if (data.is_logged_in) {
        if(onLogin !== null) { onLogin(); }
      } else {
        onMessage(data); 
      }
    }
    return ws;
}


export { request, websocket }