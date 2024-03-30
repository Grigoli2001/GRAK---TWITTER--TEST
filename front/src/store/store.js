import { configureStore} from '@reduxjs/toolkit';
import tweetSlice from '../features/tweets/tweetSlice';
import navNotifReducer from '../features/tweets/navNotifSlice';

const store = configureStore({
    reducer: {
      tweets: tweetSlice,
      navNotif: navNotifReducer,
    },
  });
export default store;
