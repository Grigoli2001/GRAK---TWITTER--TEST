import React, { useEffect, useContext } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Button } from '../components/Button'
import Tweets from '../components/tweet/Tweets'

// icons
import { FaArrowLeftLong} from "react-icons/fa6";
import { showUsername } from '../utils/utils'
import useUserContext from '../hooks/useUserContext'
import { tweetRequests } from '../constants/requests';


const BookmarksFallBack = () => {

  return (
    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-4 p-4 text-justify">
        <h4 className='text-2xl font-bold'>Save posts for later</h4>
        <p className='text-slate-500 '>Bookmark posts to easily find them again in the future.</p>
        <NavLink to="/explore" className="mt-4 self-center"> 
           <Button className=''>Explore</Button>
        </NavLink>
    </div>

  )

}

const Bookmarks = () => {

    const { user } = useUserContext()

    const navigate = useNavigate()
    const handleBack = () => {
      navigate(-1)
    }

    useEffect(() => {
        
    }, [])

  
  return (

          <>
            <div className="sticky z-50 top-0 backdrop-blur-md bg-white/75">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>


                    {/*  opens modal */}
                    <div>
                      <h3 className="font-bold text-xl">Bookmarks</h3>
                      <span className='text-sm text-slate-400'>{ showUsername(user) }</span>
                    </div>
                </div>
      
              </div>
            </div>

              <div>
                <Tweets api={tweetRequests.bookmarks} params={{ userId: user.id}} FallBackComponent={<BookmarksFallBack/>} />
              </div>
            
          </>
                
        )}
      

export default Bookmarks
