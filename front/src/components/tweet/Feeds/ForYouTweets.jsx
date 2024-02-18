import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchForYouTweetsAsync, selectForYouTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'
import TweetFallBack from '../../TweetFallBack'

const ForYouTweets = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchForYouTweetsAsync()) 
  }, [dispatch])

    const forYouTweets = useSelector(selectForYouTweets)
  return (
    <div>
        {
            forYouTweets.length > 0 ?
            forYouTweets.map(tweet => (
            <Tweet key={tweet.id} post={tweet} user={tweet.user} />
            )) : 
            <TweetFallBack />
        }
    </div>
  )
}

export default ForYouTweets