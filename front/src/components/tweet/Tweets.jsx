import React, { useContext, useEffect, useState } from 'react'  
import { UserContext } from '../../context/testUserContext'
import  Tweet  from './Tweet'
import { users, followedTweets, forYouTweets } from '../../constants/feedTest'
import instance from '../../constants/axios';
import { requests } from '../../constants/requests';

import ReactLoading from "react-loading";

const Tweets = ({api, FallBackComponent, asMedia}) => {

    /**
     * Tweets Container Template
     * TODO: add loading state
     * TODO: add error state
     * TODO: add functionality to fetch tweets from api
     */
  
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    // dummy followCollection
    const followCollection = users[0].following

      // api will determine the user for now use the context
    let { user } = useContext(UserContext)

    const getAllTweets = async () => {
      try {
        const response = await instance.get(requests.getTweets);
        setLoading(false);
        return response.data.data.tweets;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };


    useEffect(() => {
      const fetchData = async () => {
        try {
          const allTweets = await getAllTweets();
          console.log(allTweets);
          switch (api) {
            case 'following':
              setTweets(allTweets.filter((tweet) => followCollection.includes(String(tweet.userId))))
              // setTweets(followedTweets)
              break;
            case 'for-you':
              setTweets(allTweets)
              break;
            case 'bookmarks':
              let bookmarked = ([...forYouTweets]).filter((tweet) => tweet.bookmarked)
              setTweets(bookmarked)
              break;
            case 'myposts':
              let myPosts = ([...forYouTweets]).filter((tweet) => tweet.userId === user.id)
              setTweets(myPosts)
              break;
            case 'media':
              let media = ([...forYouTweets]).filter((tweet) => tweet.media)
              setTweets(media)
              break;

            default:
              {}
              break;
          }
        } catch (error) {
          console.error(error);
        } 
      }

      fetchData();
    }, [api])
  
    return (
      <div className={ asMedia && 'grid grid-cols-3 gap-1' }>
        {
        loading ? (
          <div className='flex justify-center items-start h-[80vh] mt-4'>
            <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
          </div>
        ) : (
          tweets.length ? 
            tweets.map((tweet) => {
              let user = users.filter((user) => tweet.userId === user.id)[0]
              return (
                <Tweet key={tweet._id} user={user} post={tweet}/>
              )
            })
            : 
              (FallBackComponent ?? null)
        )}
      </div>
    )
  }

  export default Tweets;
