import React, { useContext, useEffect, useState } from 'react'  
import { UserContext } from '../../context/testUserContext'
import  Tweet  from './Tweet'
import { users, followedTweets, forYouTweets } from '../../constants/feedTest'
import instance from '../../constants/axios';
import { requests } from '../../constants/requests';

import ReactLoading from "react-loading";

const Replies = ({asMedia, tweetId}) => {

    /**
     * Tweets Container Template
     * TODO: add loading state
     * TODO: add error state
     * TODO: add functionality to fetch tweets from api
     */
  
    const [replies, setReplies] = useState([])
    const [loading, setLoading] = useState(true)
    // dummy followCollection
    const followCollection = users[0].following

      // api will determine the user for now use the context
    let { user } = useContext(UserContext)

    const getAllReplies = async () => {
      try {
        const response = await instance.get(requests.getReplyTweets + tweetId);
        setReplies(response.data.data.replies);
        setLoading(false);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    useEffect(() => {
        getAllReplies();
        }, [tweetId]);

    return (
      <div className={ asMedia && 'grid grid-cols-3 gap-1' }>
        {
        loading ? (
          <div className='flex justify-center items-start h-[80vh] mt-4'>
            <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
          </div>
        ) : (
          replies.length ? 
            replies.map((tweet) => {
              return (
                <Tweet key={tweet._id} user={tweet.user} post={tweet}/>
              )
            })
            : 
            <div className="flex items-center justify-center h-96">
            <p className="text-2xl font-bold text-gray-500">
                Be the first to comment
            </p>
            </div>
        )}
      </div>
    )
  }

  export default Replies;
