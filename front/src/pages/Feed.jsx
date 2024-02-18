import  TweetCreate  from '../components/tweet/TweetCreate';
import Tweets from '../components/tweet/Tweets';
import  { Tab } from '../components/Tabs';
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { Button } from '../components/Button'
import { NavLink, Outlet } from 'react-router-dom';
import { tweetRequests } from '../constants/requests';
// icons
import { FiSettings } from "react-icons/fi";
import useUserContext from '../hooks/useUserContext';
import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/socketContext';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotif, selectNotif } from '../features/tweets/navNotifSlice';
import { useQueryClient } from '@tanstack/react-query';
import { quantityFormat } from '../utils/utils';

const FollowingFallBack = () => {
  return (
    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4 text-justify">
        <p className="text-2xl font-bold text-gray-500">
            Follow some more people with tweets to see what's happening in your world.
        </p>
      </div>
  );
};

const ForYouFallBack = () => {

  return (
    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4 text-justify">
            <h4 className='text-4xl font-bold'>Welcome to X</h4>
            <p className='text-slate-500 '>This is the best place to see what's happening in your world. Find some people and topics to follow now.</p>
            <Button className='mt-4 self-center'>Let's go</Button>
        </div>
  )
}



const Feed = () => {

  const {user} = useUserContext()

  const newPostCount = useSelector(selectNotif('home'))

  const queryClient = useQueryClient()
  const reduxDispatch = useDispatch()

  const refreshFeed = () => {
    queryClient.invalidateQueries(['tweets', tweetRequests.forYou, { userId: user.id}])
    queryClient.invalidateQueries(['tweets', tweetRequests.following, { userId: user.id}])
    reduxDispatch(removeNotif({ category: 'home'}))
  }
   
  return (
    <>
    <Tabs defaultValue={0}>
      <TabsList className='flex justify-around sticky items-center top-0  bg-white/75 z-50 gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md  '>

        <Tab text="For You"/>
        <Tab text="Following"/>

        <NavLink to="/settings">
          <Button variant='icon' size='icon-sm' tooltip="Settings" className="text-black hover:bg-gray-300/50">
            <FiSettings/>
          </Button>
        </NavLink>

      </TabsList>
      <section>
        <TweetCreate/>
        {
          newPostCount > 0 && 
          <div onClick={refreshFeed} className=" cursor-pointer bg-white/75 p-2 text-center text-sm border jover:bg-gray-300 text-twitter-blue">
            {quantityFormat(newPostCount)} new post{newPostCount > 1 ? 's' : ''}
          </div>
        }
        
        <TabPanel>
          <Tweets api={tweetRequests.forYou} params={{ userId: user.id}} FallBackComponent={ <ForYouFallBack />}/>
        </TabPanel>

        <TabPanel >
          <Tweets api={tweetRequests.following} params={{ userId: user.id}} FallBackComponent={<FollowingFallBack />} />
        </TabPanel>
      </section>

    </Tabs>
    <Outlet />
    </>
        
  )
}

export default Feed