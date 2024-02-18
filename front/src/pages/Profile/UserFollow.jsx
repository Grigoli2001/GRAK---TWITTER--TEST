import React, { useContext } from 'react'
import { Navigate, useNavigate, NavLink, useParams, useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Tab } from '../../components/Tabs'
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { UserDisplayer } from '../../components/User'
import { users } from '../../constants/feedTest'
import { UserContext } from '../../context/UserContext'


// icons
import { FaArrowLeftLong} from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { showUsername } from '../../utils/utils';


const UserFollow = ({api}) => {

    const { user } = useContext(UserContext)
    const { username } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const handleBack = () => {
      navigate(-1)
    }

  //  checks if a profile is found
  const userProfile = users.find(otheruser => otheruser.username === username)

  // TODO issue fix to maintain url but show 404 --maybe create middleware to check if user exis
  return (

    !userProfile ? <Navigate to='/404' /> :

          <>
            <div className="sticky z-50 top-0 backdrop-blur-md w-full bg-white/75">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>
                    <div>
                      <h3 className="font-bold text-xl">{user.name}</h3>
                      <span className='text-sm text-slate-400'>{showUsername(user)}</span>
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
                  <UserDisplayer api={api} limit={4}  withCard withFollow withNavTo={'/'} />
                </TabPanel>
      
                <TabPanel value={`/${username}/followers`}>
                    <UserDisplayer api={api} limit={3} withCard withFollow withNavTo={'/'} />
                </TabPanel>

                <TabPanel value={`/${username}/following`}>
                    <UserDisplayer api={api} limit={2} withCard withFollow withNavTo={'/'} />
                </TabPanel>
              
            </section>
      
          </Tabs>
      
        </>
                
      
         
      
        )}
      

export default UserFollow
