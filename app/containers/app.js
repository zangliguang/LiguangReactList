import React,{Component} from 'react';
import LoadingViewAndroid from '../components/LoadingView';
import {
    ToastShort
} from '../utils/ToastUtils';

import Splash from '../pages/Splash';
import {
    NaviGoBack
} from '../utils/CommonUtils';
import {
    StyleSheet,
    Navigator,
    StatusBar,
    BackAndroid,
    View
} from 'react-native';
var _navigator, isRemoved = false;
class App extends React.Component {
    constructor(props) {
        super(props);
        this.renderScene = this.renderScene.bind(this);
        this.goBack = this.goBack.bind(this);
        BackAndroid.addEventListener('hardwareBackPress', this.goBack);
    }
    goBack() {
        return NaviGoBack(_navigator);
    }
    renderScene(route, navigator) {
        let Component = route.component;
        _navigator = navigator;
        if (route.name === 'WebViewPage') {
            BackAndroid.removeEventListener('hardwareBackPress', this.goBack);
            isRemoved = true;
        } else {
            if (isRemoved) {
                BackAndroid.addEventListener('hardwareBackPress', this.goBack);
            }
        }
        return (<Component navigator = {navigator} route = {route}/>);
    }

    configureScene(route, routeStack) {
        return Navigator.SceneConfigs.PushFromRight;
    }

    render () {
      return (
        <View style={{flex: 1}}>
          <StatusBar
            backgroundColor="#FF0000"
            barStyle="default"
          />
          <Navigator
            ref='navigator'
            style={styles.navigator}
            configureScene={this.configureScene}
            renderScene={this.renderScene}
            initialRoute={{
              component: Splash,
              name: 'Splash'
            }}
          />
        </View>
      );
  }
}

let styles = StyleSheet.create({
    navigator: {
        flex: 1
    }
});

export default App;
