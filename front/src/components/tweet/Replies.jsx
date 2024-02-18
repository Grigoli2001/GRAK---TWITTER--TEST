
import  Tweet  from './Tweet'
import { tweetRequests } from '../../constants/requests';

import ReactLoading from "react-loading";
// import useInstance from '../../hooks/useInstance';/
import { useQuery } from '@tanstack/react-query';
import instance from '../../constants/axios';
import { useNavigate, useLocation } from 'react-router';

const Replies = ({asMedia, tweetId}) => {

    const navigate = useNavigate()  
    const location = useLocation()
    const navigateTo404 = () => {
      navigate('/404', {replace: location.pathname})
    }

    
    // const { data,  loading } = useInstance(tweetRequests.getReplyTweets + tweetId)
    const { data,   isLoading } = useQuery({
      queryKey: ['replies', tweetId],
      queryFn: async () => {
        const response = await instance.get(tweetRequests.getReplyTweets + tweetId)
        return response.data
      },
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => { 
        navigateTo404() 
      },
    })

    if (isLoading) {
      return (
        <div className='flex justify-center items-start h-[80vh] mt-4'>
          <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
        </div>
      )
    }

    console.log(data, 'replies')
    
    return (
          // AMAY FIX: change to data?.replies?.length
          data?.replies?.length > 0 ? 

            data?.replies?.map((tweet) => {
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

  export default Replies;
