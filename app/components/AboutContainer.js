'use strict';

import React, { Component, PropTypes } from 'react';
import {
  Component
} from 'react-native';
import {connect} from 'react-redux';

import About from '../pages/About';

class AboutContainer extends Component {
  render () {
    return (
      <About {...this.props} />
    );
  }
}

function mapStateToProps (state) {
  const {reddit} = state;
  return {
    reddit
  }
}

export default connect(mapStateToProps)(AboutContainer);
