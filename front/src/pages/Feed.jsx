import { useState, useEffect } from 'react'
import  TweetCreate  from '../components/tweet/TweetCreate';
import Tweet from '../components/tweet/Tweet';
import  { Tab } from '../components/Tabs';
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { Button } from '../components/Button'

// icons
import { FiSettings } from "react-icons/fi";

// test
import { users, followedTweets, forYouTweets } from '../constants/feedTest';



const Tweets = ({api}) => {

  /**
   * Tweets Container Template
   * TODO: add loading state
   * TODO: add error state
   * TODO: add functionality to fetch tweets from api
   */

  const [tweets, setTweets] = useState([])

  useEffect(() => {
    // api.getTweets().then((tweets) => {
    //   setTweets(tweets)
    // })
    // test
    let tweets = api === 'for-you' ? forYouTweets : followedTweets
    setTweets(tweets)
  }, [])

  return (
    <>
      {

        tweets.length ? 
          tweets.map((tweet) => {
            let user = users.filter((user) => tweet.userId === user.id)[0]
            return (
              <Tweet key={tweet.id} user={user} post={tweet}/>
            )
          })
          : 
          <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4 text-justify">
              <h4 className='text-4xl font-bold'>Welcome to X</h4>
              <p className='text-slate-500 '>This is the best place to see what's happening in your world. Find some people and topics to follow now.</p>
              <Button className='mt-4 self-center'>Let's go</Button>
            </div>
      }
    </>
  )

}


const Feed = () => {
   
  return (
    
    <Tabs defaultValue={0} className=''>
      <TabsList className='flex justify-around sticky items-center top-0  bg-white/85 w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>

        <Tab text="For You"/>
        <Tab text="Following"/>

        <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
          <FiSettings/>
        </Button>

      </TabsList>
      <section>
        <TweetCreate />
        
        <TabPanel>
          <Tweets api={'for-you'} />
        </TabPanel>

        <TabPanel >
          <Tweets api={'following'} />
        </TabPanel>
      </section>

    </Tabs>
        
  )
}

export default Feed