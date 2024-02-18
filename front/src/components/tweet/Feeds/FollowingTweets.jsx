import React from 'react'
import { useSelector } from 'react-redux'
import { selectFollowingTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'

const FollowingTweets = () => {
    const followingTweets = useSelector(selectFollowingTweets)
    console.log(followingTweets)
  return (
    <div>
        {
            followingTweets.length > 0 ?
            followingTweets.map(tweet => (
            <Tweet key={tweet.id} post={tweet} user={tweet.user}/>
            )):
            <h2>No tweets to show</h2>
        }
    </div>
  )
}

export default FollowingTweets