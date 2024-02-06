import React, { useContext, useEffect, useState } from 'react'  
import { UserContext } from '../../context/testUserContext'
import  Tweet  from './Tweet'
import { users, followedTweets, forYouTweets } from '../../constants/feedTest'

const Tweets = ({api, FallBackComponent, asMedia}) => {

    /**
     * Tweets Container Template
     * TODO: add loading state
     * TODO: add error state
     * TODO: add functionality to fetch tweets from api
     */
  
    const [tweets, setTweets] = useState([])

      // api will determine the user for now use the context
    let { user } = useContext(UserContext)


    useEffect(() => {
      switch (api) {
        case 'following':
          setTweets(followedTweets)
          break;
        case 'for-you':
          setTweets(forYouTweets)
          break;
        case 'bookmarks':
          let bookmarked = ([...forYouTweets, ...followedTweets]).filter((tweet) => tweet.bookmarked)
          setTweets(bookmarked)
          break;
        case 'myposts':
          let myPosts = ([...forYouTweets, ...followedTweets]).filter((tweet) => tweet.userId === user.id)
          setTweets(myPosts)
          break;
        case 'media':
          let media = ([...forYouTweets, ...followedTweets]).filter((tweet) => tweet.media)
          setTweets(media)
          break;

        default:
          {}
      }
    }, [api])
  
    return (
      <div className={ asMedia && 'grid grid-cols-3 gap-1' }>
        {
  
          tweets.length ? 
            tweets.map((tweet, index, arr) => {
              let user = users.filter((user) => tweet.userId === user.id)[0]
              return (

                <Tweet key={tweet.id} user={user} post={tweet} isLast={index===arr.length - 1}  asMedia={asMedia} />
              )
            })
            : 
            (FallBackComponent ?? null)
        }
      </div>
    )
  
  }

  export default Tweets;
