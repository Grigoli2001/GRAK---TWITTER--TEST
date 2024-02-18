import { createSlice } from '@reduxjs/toolkit';
import instance from '../../constants/axios';
import { tweetRequests } from '../../constants/requests';


// Slice that handles all user tweets

const tweetSlice = createSlice({
  name: 'tweets',
  initialState: {
    forYou: [],
    following: [],
    liked: [],
    bookmarked: [],
    retweets: [],
    myTweets: [],
  },
  reducers: {
    setForYouTweets: (state, action) => {
      console.log('action.payload', action.payload)
      state.forYou = action.payload;
    },
    setFollowingTweets: (state, action) => {
      state.following = action.payload;
    },
    setLikedTweets: (state, action) => {
      state.liked = action.payload;
    },
    setBookmarkedTweets: (state, action) => {
      state.bookmarked = action.payload;
    },
    setRetweets: (state, action) => {
      state.retweets = action.payload;
    },
    setMyTweets: (state, action) => {
      console.log('action.payload', action.payload)

      state.myTweets = action.payload;
    },

  },
});

export const {
  setForYouTweets,
  setFollowingTweets,
  setLikedTweets,
  setBookmarkedTweets,
    setRetweets,
    setMyTweets,

} = tweetSlice.actions;

export const fetchAllTweetsAsync = () => async (dispatch) => {
  try {
    const forYou = await instance.get(tweetRequests.forYou)
    dispatch(setForYouTweets(forYou.data.data.tweets));

    const following = await instance.get(tweetRequests.following)
    dispatch(setFollowingTweets(following.data.data.tweets));

    const liked = await instance.get(tweetRequests.likes)
    dispatch(setLikedTweets(liked.data.data.tweets));

    const bookmarked = await instance.get(tweetRequests.bookmarks)
    dispatch(setBookmarkedTweets(bookmarked.data.data.tweets));

    const retweets = await instance.get(tweetRequests.retweets)
    dispatch(setRetweets(retweets.data.data.tweets));

    const myTweets = await instance.get(tweetRequests.mytweets)
    dispatch(setMyTweets(myTweets.data.data.tweets));

  } catch (error) {
    console.error('Error fetching for you tweets:', error);
  }
};

export const fetchForYouTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.forYou)
    dispatch(setForYouTweets(fetchedData.data.data.tweets));
  } catch (error) {
    console.error('Error fetching for you tweets:', error);
  }
};


export const fetchFollowingTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.following)
    dispatch(setFollowingTweets(fetchedData.data.data.tweets));
  } catch (error) {
    console.error('Error fetching following tweets:', error);
  }
};

export const fetchLikedTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.likes)
    dispatch(setLikedTweets(fetchedData.data.data.tweets));
  } catch (error) {
    console.error('Error fetching liked tweets:', error);
  }
};

export const fetchBookmarkedTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.bookmarks)
    dispatch(setBookmarkedTweets(fetchedData.data.data.tweets));
  } catch (error) {
    console.error('Error fetching bookmarked tweets:', error);
  }
};

export const fetchReTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.retweets)
    dispatch(setRetweets(fetchedData.data.data.tweets));
  } catch (error) {
    console.error('Error fetching retweets:', error);
  }
};

export const fetchMyTweetsAsync = () => async (dispatch) => {
  try {
    const fetchedData = await instance.get(tweetRequests.mytweets)
    dispatch(setMyTweets(fetchedData));
  } catch (error) {
    console.error('Error fetching my tweets:', error);
  }
};


export const selectForYouTweets = (state) => state.tweets.forYou;
export const selectMyTweets = (state) => state.tweets.myTweets;
export const selectFollowingTweets = (state) => state.tweets.following;
export const selectLikedTweets = (state) => state.tweets.liked;
export const selectBookmarkedTweets = (state) => state.tweets.bookmarked;
export const selectReTweets = (state) => state.tweets.reTweets;

export default tweetSlice.reducer;
