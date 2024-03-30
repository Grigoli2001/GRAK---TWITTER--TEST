import React from 'react'
import { useSelector } from 'react-redux'
import { selectReTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'

const Retweets = () => {
    const retweets = useSelector(selectReTweets)
  return (
    <div>
        {
          retweets.length > 0 ?
            retweets.map(tweet => (
            <Tweet key={tweet.id} post={tweet} user={tweet.user}/>
            )) :
            <h2>No retweets</h2>
        }
    </div>
  )
}

export default Retweets