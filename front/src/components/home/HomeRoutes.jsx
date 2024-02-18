import { useEffect } from 'react';
import { Route } from 'react-router-dom'
import NavModal from '../NavModal'
import TweetCreate from '../tweet/TweetCreate'
import { Button } from '../Button'
import { FaXmark } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';


const TweetCreateModal = ({backTo}) =>{
    const navigate = useNavigate()
    
    return (
        <NavModal backTo={backTo}>
            <div className='bg-white p-6 rounded-2xl mb-auto mt-12 relative w-fit'>
                <Button onClick={() => navigate(backTo || -1) } variant="icon" tooltip={'Close'} size="icon-sm" className="top-4 left-4 text-black bg-transparent hover:bg-gray-200/75 transition-colors duration-300">
                    <FaXmark />
                </Button>
                <TweetCreate onModal={true}/>
            </div>
        </NavModal>
    )
}

const TweetPostModal = ({backTo}) =>{
    const navigate = useNavigate()
    const location = useLocation()
  
    useEffect(() => {
        const navigateBack = () => {
            navigate(backTo || -1)
        }
        if (!location.state?.postState) {
            navigateBack()
        }
    }, [location, backTo])

    return (
        <NavModal backTo={backTo}>
            <div className='bg-white p-6 rounded-2xl mb-auto mt-12 relative w-fit'>
                <Button onClick={() => navigate(backTo || -1) } variant="icon" tooltip={'Close'} size="icon-sm" className="top-4 left-4 text-black bg-transparent hover:bg-gray-200/75 transition-colors duration-300">
                    <FaXmark />
                </Button>
                <TweetCreate type="Quote" onModal={true} quote={location.state?.postState} />
            </div>
        </NavModal>
    )
}


export const HomeRoutes = (backTo) => {
  return (
    <>
    <Route path='tweet' element={ <TweetCreateModal backTo={backTo} />} />
    <Route path='post' element={ <TweetPostModal backTo={backTo} />} />
    </>
    
  )
}
