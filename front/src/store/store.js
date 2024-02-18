import { configureStore} from '@reduxjs/toolkit';
import tweetSlice from '../features/tweets/tweetSlice';

const store = configureStore({
    reducer: {
      tweets: tweetSlice,
    },
  });
export default store;
