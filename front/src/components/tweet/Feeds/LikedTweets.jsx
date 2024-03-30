import React from 'react'
import { useSelector } from 'react-redux'
import {selectLikedTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'

const LikedTweets = () => {
    const likedTweets = useSelector(selectLikedTweets)
  return (
    <div>
        {
            likedTweets.length > 0 ?
            likedTweets.map(tweet => (
            <Tweet key={tweet.id} post={tweet} user={tweet.user} />
            )):
            <h2>No liked tweets</h2>
        }
    </div>
  )
}

export default LikedTweets