import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Tab } from '../components/Tabs'
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import { UserDisplayer } from '../components/User'
import { requests } from '../constants/requests'

// icons
import { FaArrowLeftLong} from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";


const Connect = () => {
  
    const navigate = useNavigate()
    const handleBack = () => {
      navigate(-1)
    }
  
  return (

          <>
            <div className="sticky z-50 top-0 backdrop-blur-md w-full bg-white/75">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>
      
                    <h3 className="font-bold text-xl py-2">Connect</h3>
                    <Button onClick={() => navigate('/settings')} variant='icon' size='icon-sm' tooltip="Settings" className="ml-auto text-black hover:bg-gray-300/50">
                        <FiSettings/>
                    </Button>
    
                </div>
      
              </div>
            </div>
            
                  
      <Tabs defaultValue={0} className=''>
            <TabsList className='flex justify-around  items-center w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>
              <Tab text="Who To Follow"/>
              <Tab text="Creators for you"/>
            </TabsList>
      
              <section>
                <TabPanel>
                    <h2 className="text-xl font-bold p-3" >Suggested for you</h2>
                    <UserDisplayer api={requests.exploreUsers} params={{limit:5}} withCard withFollow withNavTo="/" isInfinite={false} />
                </TabPanel>
      
                <TabPanel>
                    <h2 className="text-xl font-bold p-3" >Creators for you</h2>
                    <UserDisplayer api={requests.exploreUsers} params={{limit:5}} withCard withFollow withNavTo="/" isInfinite={false} />
                </TabPanel>
              
            </section>
      
            </Tabs>
      
            </>
                
      
         
      
        )}
      

export default Connect

