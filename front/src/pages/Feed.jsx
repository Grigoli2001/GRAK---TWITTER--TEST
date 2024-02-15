import  TweetCreate  from '../components/tweet/TweetCreate';
import Tweets from '../components/tweet/Tweets';
import  { Tab } from '../components/Tabs';
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { Button } from '../components/Button'
import { Outlet } from 'react-router-dom';
import FollowingFallBack from '../components/FollowingFallBack';
import TweetFallBack from '../components/TweetFallBack';

// icons
import { FiSettings } from "react-icons/fi";


const Feed = () => {
   
  return (
    <>
    <Tabs defaultValue={0}>
      <TabsList className='flex justify-around sticky items-center top-0  bg-white/75 z-50 gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md  '>

        <Tab text="For You"/>
        <Tab text="Following"/>

        <Button variant='icon' size='icon-sm' tooltip="Settings" className="text-black hover:bg-gray-300/50">
          <FiSettings/>
        </Button>

      </TabsList>
      <section>
        <TweetCreate />
        
        <TabPanel>
          <Tweets api={"for-you"} FallBackComponent={TweetFallBack()}/>
        </TabPanel>

        <TabPanel >
          <Tweets api={'following'} FallBackComponent={FollowingFallBack()} />
        </TabPanel>
      </section>

    </Tabs>
    <Outlet />
    </>
        
  )
}

export default Feed