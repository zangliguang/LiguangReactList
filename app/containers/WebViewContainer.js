'use strict';

import React, { Component } from 'react';
import {connect} from 'react-redux';

import WebViewPage from '../pages/WebViewPage';

class WebViewContainer extends Component {
  render () {
    return (
      <WebViewPage {...this.props} />
    );
  }
}

function mapStateToProps (state) {
  const {reddit} = state;
  return {
    reddit
  }
}

export default connect(mapStateToProps)(WebViewContainer);
