'use strict';

import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  ListView,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  InteractionManager,
  ProgressBarAndroid,
  Image,
  DrawerLayoutAndroid,
  Dimensions,
  View
  } from 'react-native';
import LoadingView from '../components/LoadingView';
import {fetchReddit} from '../actions/reddit';
import CustomTabBar from '../components/CustomTabBar';
import CustomToolbar from '../components/CustomToolbar';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import WebViewContainer from '../containers/WebViewContainer';
import AboutContainer from '../containers/AboutContainer';
import {ToastShort} from '../utils/ToastUtils';
import * as Urls from '../constants/Urls';
import * as Alias from '../constants/Alias';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  reddit: PropTypes.object.isRequired
};

var canLoadMore;
var _typeIds = new Array();
var loadMoreTime = 0;

class Main extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderNavigationView = this.renderNavigationView.bind(this);
    this.onIconClicked = this.onIconClicked.bind(this);
    this.onScroll = this.onScroll.bind(this);
    canLoadMore = false;
  }

  componentDidMount () {
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      _typeIds = [1, 2, 3, 4];
      _typeIds.forEach((typeId) => {
        dispatch(fetchReddit(false, true, typeId));
      });
    });

  }

  componentWillReceiveProps (nextProps) {
    const {reddit} = this.props;
    if (reddit.isLoadMore && !nextProps.reddit.isLoadMore && !nextProps.reddit.isRefreshing) {
      if (nextProps.reddit.noMore) {
        ToastShort('没有更多数据了');
      }
    }
  }

  onRefresh (typeId) {
    const {dispatch} = this.props;
    canLoadMore = false;
    dispatch(fetchReddit(true, false, typeId));
  }

  onPress (reddit) {
    const {navigator} = this.props;
    console.error('click:', reddit);
    InteractionManager.runAfterInteractions(() => {
      navigator.push({
        component: WebViewContainer,
        name: 'WebViewPage',
        reddit: reddit
      });
    });
  }

  onPressDrawerItem (index) {
    const {navigator} = this.props;
    this.refs.drawer.closeDrawer();
    switch (index) {
      case 2:
        InteractionManager.runAfterInteractions(() => {
          navigator.push({
            component: AboutContainer,
            name: 'About'
          });
        });
        break;
      default:
        break;
    }
  }

  onIconClicked () {
    this.refs.drawer.openDrawer();
  }

  onScroll () {
    if (!canLoadMore) {
      canLoadMore = true;
    }
  }

  onEndReached (typeId) {
    let time = Date.parse(new Date()) / 1000;
    const {reddit} = this.props;
    if (canLoadMore && time - loadMoreTime > 1) {
      const {dispatch} = this.props;
      dispatch(fetchReddit(false, false, typeId, true, 25, reddit.redditAfter[typeId]));
      canLoadMore = false;
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  }

  renderFooter () {
    const {reddit} = this.props;
    if (reddit.isLoadMore) {
      return (
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <ProgressBarAndroid styleAttr='Inverse' color='#3e9ce9'/>
          <Text style={{textAlign: 'center', fontSize: 16}}>
            加载中…
          </Text>
        </View>
      );
    }
  }

  renderItem (reddit, sectionID, rowID) {
    const thumbnail = reddit.data.thumbnail.lastIndexOf("http") >= 0 ? reddit.data.thumbnail : 'https://www.redditstatic.com/reddit404b.png';
    console.log('render', reddit.data.thumbnail.lastIndexOf("http"));
    return (
      <TouchableOpacity onPress={this.onPress.bind(this, reddit)}>
        <View style={styles.containerItem}>
          <Image
            style={{width: 88, height: 88, marginRight: 10,borderRadius:44}}
            source={{uri: thumbnail}}
          />
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={styles.title}>
              {reddit.data.title}
            </Text>
            <View style={{flex:1,flexDirection:'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{fontSize: 14, color: '#aaaaaa', marginTop: 5}}>
                  来自：
                </Text>
                <Text style={{flex: 1, fontSize: 14, color: '#ff0000', marginTop: 5, marginRight: 5}}>
                  {reddit.data.author}
                </Text>
              </View>

              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{fontSize: 14, color: '#aaaaaa', marginTop: 5}}>
                  赞：
                </Text>
                <Text style={{flex: 1, fontSize: 14, color: '#ff0000', marginTop: 5, marginRight: 5}}>
                  {reddit.data.ups}
                </Text>
              </View>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderContent (dataSource, typeId) {
    const {reddit} = this.props;
    if (reddit.loading) {
      return <LoadingView/>;
    }
    let isEmpty = reddit.redditList[typeId] == undefined || reddit.redditList[typeId].length == 0;
    if (isEmpty) {
      return (
        <ScrollView
          automaticallyAdjustContentInsets={false}
          horizontal={false}
          contentContainerStyle={styles.no_data}
          style={{flex: 1}}
          refreshControl={
            <RefreshControl
              refreshing={reddit.isRefreshing}
              onRefresh={this.onRefresh.bind(this, typeId)}
              title="Loading..."
              colors={['#ffaa66cc', '#ff00ddff', '#ffffbb33', '#ffff4444']}
            />
          }
        >
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>
              正在与网络撕扯...
            </Text>
          </View>
        </ScrollView>
      );
    }
    return (
      <ListView
        initialListSize={1}
        dataSource={dataSource}
        renderRow={this.renderItem}
        style={styles.listView}
        onEndReached={this.onEndReached.bind(this, typeId)}
        onEndReachedThreshold={10}
        onScroll={this.onScroll}
        renderFooter={this.renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={reddit.isRefreshing}
            onRefresh={this.onRefresh.bind(this, typeId)}
            title="Loading..."
            colors={['#ff0000', '#ff0000', '#ff0000', '#ff0000']}
          />
        }
      />
    );
  }

  renderNavigationView () {
    return (
      <View style={[styles.container, {backgroundColor: '#fcfcfc'}]}>
        <Image
          style={{width: Dimensions.get('window').width / 5 * 3, height: 120, justifyContent: 'flex-end', paddingBottom: 10}}
          source={require('../img/reddit_bg.png')}
        >
          <Text style={{fontSize: 20, textAlign: 'left', color: '#fcfcfc', marginLeft: 10}}>
            xReddit
          </Text>
        </Image>
        <TouchableOpacity
          style={styles.drawerContent}
          onPress={this.onPressDrawerItem.bind(this, 0)}
        >
          <Image
            style={styles.drawerIcon}
            source={require('../img/reddit_red.png')}
          />
          <Text style={styles.drawerText}>
            首页
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerContent}
          onPress={this.onPressDrawerItem.bind(this,2)}
        >
          <Image
            style={styles.drawerIcon}
            source={require('../img/about.png')}
          />
          <Text style={styles.drawerText}>
            关于
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render () {
    const {reddit, navigator} = this.props;
    var lists = [];
    _typeIds.forEach((typeId) => {
      lists.push(
        <View
          key={typeId}
          tabLabel={Alias.CATEGORIES[typeId]}
          style={{flex: 1}}
        >
          {this.renderContent(this.state.dataSource.cloneWithRows(reddit.redditList[typeId] == undefined ? [] : reddit.redditList[typeId]), typeId)}
        </View>);
    });
    return (
      <DrawerLayoutAndroid
        ref='drawer'
        drawerWidth={Dimensions.get('window').width / 5 * 3}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this.renderNavigationView}
      >
        <View style={styles.container}>
          <CustomToolbar
            title="黎光"
            navigator={navigator}
            navIcon={require('../img/menu.png')}
            onIconClicked={this.onIconClicked}
          />
          <ScrollableTabView
            renderTabBar={() => <CustomTabBar />}
            tabBarBackgroundColor="#fcfcfc"
            tabBarUnderlineColor="#FF0000"
            tabBarActiveTextColor="#FF0000"
            tabBarInactiveTextColor="#aaaaaa"
          >
            {lists}
          </ScrollableTabView>
        </View>
      </DrawerLayoutAndroid>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  containerItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1
  },
  title: {
    flex: 3,
    fontSize: 18,
    textAlign: 'left',
    color: 'black'
  },
  listView: {
    backgroundColor: '#eeeeec'
  },
  no_data: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100
  },
  drawerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  drawerIcon: {
    width: 30,
    height: 30,
    marginLeft: 5
  },
  drawerText: {
    fontSize: 18,
    marginLeft: 15,
    textAlign: 'center',
    color: 'black'
  }
});

Main.propTypes = propTypes;

export default Main;
