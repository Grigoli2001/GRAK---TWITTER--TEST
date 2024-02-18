import React from 'react'
import { useSelector } from 'react-redux'
import { selectBookmarkedTweets } from '../../../features/tweets/tweetSlice'
import Tweet from '../Tweet'

const BookmarkedTweets = () => {
    const bookmarkedTweets = useSelector(selectBookmarkedTweets)
  return (
    <div>
        {
            bookmarkedTweets.length > 0 ?
            bookmarkedTweets.map(tweet => (
            <Tweet key={tweet.id} post={tweet} user={tweet.user}/>
            )): 
            <h1>No Bookmarked Tweets</h1>
        }
    </div>
  )
}

export default BookmarkedTweets