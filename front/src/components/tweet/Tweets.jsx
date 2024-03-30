import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactLoading from 'react-loading';
// import { useSelector } from 'react-redux';
// import {
//   selectBookmarkedTweets,
//   selectFollowingTweets,
//   selectForYouTweets,
//   selectLikedTweets,
//   selectMyTweets,
//   selectReTweets,
// } from '../../features/tweets/tweetSlice';
// import FollowingTweets from './Feeds/FollowingTweets';
// import ForYouTweets from './Feeds/ForYouTweets';
// import BookmarkedTweets from './Feeds/BookmarkedTweets';
// import MyTweets from './Feeds/MyTweets';
// import LikedTweets from './Feeds/LikedTweets';
// import Retweets from './Feeds/Retweets';
import Tweet from './Tweet';
import { createToast } from '../../hooks/createToast';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import instance from '../../constants/axios';

// const useTweetsSelector = (api) => {
//   switch (api) {
//     case 'following':
//       console.log('following');
//       return FollowingTweets;
//     case 'for-you':
//       console.log('for-you');
//       return ForYouTweets;
//     case 'bookmarks':
//       console.log('bookmarks');
//       return BookmarkedTweets;
//     case 'mytweets':
//       console.log('mytweets');
//       return MyTweets;
//     case 'likes':
//       console.log('likes');
//       return LikedTweets;
//     case 'retweets':
//       console.log('retweets');
//       return Retweets;
//     default:
//       console.log('default');
//       return ForYouTweets;
//   }
// };

// const Tweets = ({ api, FallBackComponent, asMedia }) => {
//   const [loading, setLoading] = useState(false);
//   const TweetComponent = useTweetsSelector(api);

 

//   return (
//     <div className={asMedia && 'grid grid-cols-3 gap-1'}>
//       {loading ? (
//         <div className='flex justify-center items-start h-[80vh] mt-4'>
//           <ReactLoading type='spin' color='#1da1f2' height={30} width={30} />
//         </div>
//       ) : (
//         <TweetComponent />
//       )}
//     </div>
//   );
// };
const Tweets = ({ api, params, FallBackComponent, asMedia  }) => {

  const { status, error, data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading} = useInfiniteQuery({

    queryKey: ['tweets',api, params ],

    getNextPageParam: (lastPage, allpages) => {
      if (lastPage?.tweets.length < 20 ) return  undefined
      return lastPage.prevPage + 1
    },
    keepPreviousData: true, // prefer loading to previous data
    initialPageParam: 0,
    // makes sure all params are defined
    enabled: Object.values(params).every((param) => param),
    queryFn: async ({ queryKey, pageParam  }) => {
      const response =  await instance.get(api, { params: {...queryKey[2], page: pageParam} })
      return {...response.data, prevPage: pageParam}
    }
  })

  const observer = useRef()
  const lastTweet = useCallback(tweet => {

    if (isLoading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage){
          fetchNextPage()
        }
    }, 
    {
        // root: messageWindowRef.current,
        // rootMargin: "12px",
        threshold:0.8,
    }
    )
    if (tweet) observer.current.observe(tweet)
}, [isLoading, hasNextPage])


  if (status === 'loading') {
    return (
      <div className='flex justify-center items-start h-full mt-4'>
        <ReactLoading type='spin' color='#1da1f2' height={30} width={30} />
      </div>
    )
  }

  if (error) {
    console.log('Error fetching for you tweets:', error);
    createToast('An occurred while fetching the tweets', 'error')
    return FallBackComponent
  }

  // const tweets = []y
  const tweets = data?.pages?.reduce((acc, page) => {
    return [...acc, ...page.tweets]
  }, [])


  if (tweets && tweets.length === 0 || error) {
    return FallBackComponent
  }

  return (
    <>
      <div className={asMedia && 'grid grid-cols-3 gap-1'}>
        {tweets && tweets.map((tweet, index, arr) => (
          <Tweet key={tweet._id} post={tweet} user={tweet.user} asMedia={asMedia} {...(index === arr.length - 1 && {ref: lastTweet})} />
        ))}
      </div>
      { ((isLoading || isFetchingNextPage)) &&
        <div className='p-4 flex items-center justify-center w-full mx-auto'>
        <ReactLoading type='spin' color='#1da1f2' height={30} width={30} />
        </div>
        }
    </>
  );
};

export default Tweets;
