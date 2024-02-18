import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectMyTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'

const MyTweets = () => {
    const myTweets = useSelector(selectMyTweets)

    // useEffect(() => {
    //   console.log('in my tweets component')
    //   console.log(myTweets)
    // }, [myTweets])
  return (
    <div>
        {
            myTweets.length > 0 ?
            myTweets.map(tweet => (
            <Tweet key={tweet._id} post={tweet} user={tweet.user}/>
            )):
            <h2>No tweets to show</h2>
        }
    </div>
  )
}

export default MyTweets