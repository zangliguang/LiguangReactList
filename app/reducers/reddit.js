'use strict';

import * as types from '../constants/ActionTypes';

const initialState = {
  isRefreshing: false,
  loading: false,
  isLoadMore: false,
  noMore: false,
  redditList: {},
  redditAfter: {1: '', 2: '', 3: '', 4: ''}
};

export default function reddit (state = initialState, action) {
  switch (action.type) {
    case types.FETCH_REDDIT_LIST:
      return Object.assign({}, state, {
        isRefreshing: action.isRefreshing,
        loading: action.loading,
        isLoadMore: action.isLoadMore
      });
    case types.RECEIVE_REDDIT_LIST:
      return Object.assign({}, state, {
        isRefreshing: false,
        isLoadMore: false,
        noMore: action.redditData.children.length == 0,
        redditList: state.isLoadMore ? loadMore(state, action) : combine(state, action),
        loading: state.redditList[action.typeId] == undefined
      });
    default:
      return state;
  }
}

function combine (state, action) {
  state.redditList[action.typeId] = action.redditData.children;
  state.redditAfter[action.typeId] = action.after;
  console.info('after=', state.after);
  return state.redditList;
}

function loadMore (state, action) {
  state.redditList[action.typeId] = state.redditList[action.typeId].concat(action.redditData.children);
  state.redditAfter[action.typeId] = action.after;
  state.after = action.after;
  console.error('after=', action.redditData.after);
  console.error(state.redditList);
  return state.redditList;
}