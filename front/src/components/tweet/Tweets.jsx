import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useSelector } from 'react-redux';
import {
  selectBookmarkedTweets,
  selectFollowingTweets,
  selectForYouTweets,
  selectLikedTweets,
  selectMyTweets,
  selectReTweets,
} from '../../features/tweets/tweetSlice';
import FollowingTweets from './Feeds/FollowingTweets';
import ForYouTweets from './Feeds/ForYouTweets';
import BookmarkedTweets from './Feeds/BookmarkedTweets';
import MyTweets from './Feeds/MyTweets';
import LikedTweets from './Feeds/LikedTweets';
import Retweets from './Feeds/Retweets';

const useTweetsSelector = (api) => {
  switch (api) {
    case 'following':
      console.log('following');
      return FollowingTweets;
    case 'for-you':
      console.log('for-you');
      return ForYouTweets;
    case 'bookmarks':
      console.log('bookmarks');
      return BookmarkedTweets;
    case 'mytweets':
      console.log('mytweets');
      return MyTweets;
    case 'likes':
      console.log('likes');
      return LikedTweets;
    case 'retweets':
      console.log('retweets');
      return Retweets;
    default:
      console.log('default');
      return ForYouTweets;
  }
};

const Tweets = ({ api, FallBackComponent, asMedia }) => {
  const [loading, setLoading] = useState(false);
  const TweetComponent = useTweetsSelector(api);

 

  return (
    <div className={asMedia && 'grid grid-cols-3 gap-1'}>
      {loading ? (
        <div className='flex justify-center items-start h-[80vh] mt-4'>
          <ReactLoading type='spin' color='#1da1f2' height={30} width={30} />
        </div>
      ) : (
        <TweetComponent />
      )}
    </div>
  );
};

export default Tweets;
