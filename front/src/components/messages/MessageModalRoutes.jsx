import { Route, useNavigate } from 'react-router-dom';
import NavModal from '../NavModal';
import { FaXmark } from "react-icons/fa6";
import SearchBar from '../SearchBar';
import { UserDisplayer } from '../User';
import { Button } from '../Button';
import { followRequests } from '../../constants/requests';
import useUserContext from '../../hooks/useUserContext';

export const MessageComposeModal = ({backTo}) => {
    const navigate = useNavigate()
    const { user }= useUserContext()
    return (
        <NavModal backTo={backTo}>
            <div className='block w-fit h-[80%] min-w-[40%] overflow-y-auto bg-white rounded-2xl'>
                <div className='flex items-center p-4'> 
                    <Button onClick={() => navigate(backTo || -1) } variant="icon" tooltip={'Close'} size="icon-sm" className="text-black bg-transparent hover:bg-gray-200/75 transition-colors duration-300">
                        <FaXmark  />
                    </Button>
                    <h4 className="text-xl font-bold text-black ml-6">
                        New Message
                    </h4>
                {/* Removed next button as there are no group chats */}
                </div>
                <div className='p-4'>
                    <SearchBar placeholder="Search for people" forceMode={'users'} withNavTo={'/messages/'} />
                </div>

                <UserDisplayer api={followRequests.followData + `?userId=${user.id}&followType=following`} withNavTo={'/messages/'} />

            </div>
        </NavModal>
    )

}

export const MessageModalRoutes = (backTo) => {
    return (
        <Route path='/messages/i/compose' element={ <MessageComposeModal backTo={backTo} />} />
    )
}
