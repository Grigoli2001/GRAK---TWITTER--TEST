import {  useNavigate, NavLink, useParams, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Tab } from '../../components/Tabs'
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { UserDisplayer } from '../../components/User'
import { followRequests } from '../../constants/requests'

// icons
import { FaArrowLeftLong} from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { showUsername } from '../../utils/utils';
import { useContext } from 'react';
import { ValidUserContext } from '../../components/RequireValidUser';
import useUserContext from '../../hooks/useUserContext';


const FollowingFallback = ({user, activeUser}) => { 
  return (
    <div className='flex justify-center items-center h-full p-6'>
      <span> {user.id === activeUser.id ?  "You are not following anyone right now ": showUsername(activeUser) + " doesn't follow anyone!" }</span>
    </div>
  )
}

const FollowersFallback = ({verified=false, user, activeUser}) => { 
  return (
    <div className='flex justify-center items-center h-full w-full p-8'>
      {
        activeUser.id === user.id ?
        <div className='max-w-[300px] flex flex-col font-semibold'>
          <span>You have no {verified && 'verified'} followers yet</span>
          <span>Try making some post and interacting with more users!</span>
        </div>
         :
         <>
          <span>{showUsername(activeUser)} has no {verified && 'verified'} followers yet</span>
        </>
      }
    </div>
  )
}

    


const UserFollow = () => {

    const { username } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { activeUser } = useContext(ValidUserContext)
    const { user } = useUserContext()
    const handleBack = () => {
      navigate(-1)
    }
  //  checks if a profile is found
  return (


          <>
            <div className="sticky z-50 top-0 backdrop-blur-md w-full bg-white/75">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>
                    <div>
                      <h3 className="font-bold text-xl">{activeUser?.name}</h3>
                      <span className='text-sm text-slate-400'>{showUsername(activeUser)}</span>
                    </div>
                    
                    <Button onClick={() => navigate('/settings')} variant='icon' size='icon-sm' tooltip="Settings" className="ml-auto text-black hover:bg-gray-300/50">
                        <FiSettings/>
                    </Button>
    
                </div>
      
              </div>
            </div>
            
                  
          <Tabs value={location.pathname} className=''>
            <TabsList className='flex justify-around  items-center w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>
                <Tab text="Verified Followers" slots={{root: NavLink}} value={`/${username}/verified-followers`} to={`/${username}/verified-followers`} />
                <Tab text="Followers" slots={{root: NavLink}} value={`/${username}/followers`} to={`/${username}/followers`} />  
                <Tab text="Following" slots={{root: NavLink}} value={`/${username}/following`} to={`/${username}/following`} />
            </TabsList>
      
              <section>
                <TabPanel value={`/${username}/verified-followers`}>
                  <UserDisplayer api={followRequests.followData + `?userId=${activeUser?.id}&followType=followers&verified=true`} 
                    withFollow withNavTo={'/'} FallbackComponent={<FollowersFallback verified={true} user={user} activeUser={activeUser}/> }/>
                </TabPanel>
      
                <TabPanel value={`/${username}/followers`}>
                    <UserDisplayer api={followRequests.followData + `?userId=${activeUser?.id}&followType=followers`} 
                      withFollow withNavTo={'/'} FallbackComponent={<FollowersFallback user={user} activeUser={activeUser}/>}/>
                </TabPanel>

                <TabPanel value={`/${username}/following`}>
                    <UserDisplayer api={followRequests.followData + `?userId=${activeUser?.id}&followType=following`} 
                     withFollow withNavTo={'/'} FallbackComponent={<FollowingFallback user={user} activeUser={activeUser}/>} />
                </TabPanel>
              
            </section>
      
          </Tabs>
      
        </>
                
      
         
      
        )}
      

export default UserFollow
