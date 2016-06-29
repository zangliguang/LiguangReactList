import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './containers/app'
import configureStore from './store/configure-store'
const store = configureStore();

import {
  Image,
  } from 'react-native';
class Root extends React.Component{

  render(){
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    )
  }
}

export default Root;
