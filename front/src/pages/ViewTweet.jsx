import { Button } from '../components/Button'

import React, { useEffect, useState } from 'react'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'
import Tweet from '../components/tweet/Tweet'
import instance from '../constants/axios'
import { users } from '../constants/feedTest'
import { requests } from '../constants/requests'
import FullTweet from '../components/tweet/FullTweet'
import TweetCreate from '../components/tweet/TweetCreate'
import Replies from '../components/tweet/Replies'


const ViewTweet = () => {
  const { tweetId } = useParams()
  const tweetBox = React.createRef()
  console.log('id', tweetId)
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className='view-tweet-container'>
      <div className="sticky z-50 top-0 backdrop-blur-md bg-white/75" >
        <div className="px-2 py-3">

          <div className='flex items-center gap-x-4'>
            <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
              <FaArrowLeftLong className='text-black' />
            </Button>


            {/*  opens modal */}
            <div>
              <h3 className="font-bold text-xl">Post</h3>
            </div>
          </div>

        </div>
      </div>

      <div className='mt-3'>
        <div>
          <FullTweet tweetId={tweetId} complete={true} />
        </div>

        <div>
          <TweetCreate type='Reply' reference_id={tweetId} />
        </div>

        <div>
          <Replies tweetId={tweetId} />

          {/* Empty div to allow for scrolling */}
          <div className="mt-[50%]"></div>
        </div>
      </div>


    </div>
  )
}

export default ViewTweet