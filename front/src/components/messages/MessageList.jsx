import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { BsEnvelopePlus } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";

import { UserBlock } from '../User';
import '../../styles/messages.css'
import { FaEllipsis } from 'react-icons/fa6';
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react'
import { evalRoom } from '../../utils/utils';
import instance from '../../constants/axios';
import { createToast } from '../../hooks/createToast';
import useUserContext from '../../hooks/useUserContext';
import useInstance from '../../hooks/useInstance';
import { requests } from '../../constants/requests';
import ReactLoading from 'react-loading'
import useDebounce from '../../hooks/useDebounce';


const RoomDeletePopup = ({room, user, otherUser, handleDeleteRoom}) => {  
    const [showRoomDeletePopup, setShowRoomDeletePopup] = useState(false)

    return(
    <Popover placement='bottom-end' offset={{mainAxis: -50}} handler={setShowRoomDeletePopup} open={showRoomDeletePopup}>
        <PopoverHandler className='ml-auto mr-2'>
            <div>
                <Button tooltip="More" variant="icon" size="icon-sm" className="invisible group-hover:visible text-slate-800 p-2 cursor-pointer rounded-full hover:bg-twitter-blue/15 hover:text-twitter-blue">
                    <FaEllipsis/>
                </Button>
            </div>
    </PopoverHandler>
        <PopoverContent className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10'>
            <ul className='list-none text-sm'>
                <li  onClick={() => {handleDeleteRoom(room, otherUser);setShowRoomDeletePopup(false)}} 
                className='text-red-500 hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'>
                    <RiDeleteBinLine className=""/> Delete conversation</li>
            </ul>
        </PopoverContent>
    </Popover>

    )
}

const MessageList = () => {
    const [deletedRoom, setDeletedRoom] = useState(null)
    const { user } = useUserContext()
    const navigate = useNavigate()
    const location = useLocation()
    const [initialChats, setInitialChats] = useState([])
    const [search, setSearch] = useState('')
    
    const { data: userList, setData: setUserList, loading, setLoading, hasLoaded } = useInstance(requests.getActiveChats, {page: 0, limit: 10})
    
    useEffect(() => {
        // console.log(userList, hasLoaded)
        if (userList && hasLoaded) {
            console.log('setting initial chats', userList)
            setInitialChats(userList)
            // setLoaded(true)
        }
    }, [hasLoaded])


    const handleDeleteRoom = (room, otherUser) => {
        instance.delete('/messages/delete-room', {
                data: {
                    room_id: room
            }
        }).then(res => {
            console.log(otherUser)
            const filterUsers = userList?.users?.filter(ouser => ouser.id != otherUser.id)
            console.log(filterUsers)
            setUserList({users: filterUsers})
            setInitialChats({users: filterUsers})
            if (!filterUsers?.length) {
                navigate('/messages')
                }else{
                    navigate(`/messages/${userList?.users[0]?.username}`)
                }
            if (res.status === 204) {createToast('This conversation has already been deleted', 'success', 'success-del-room', {limit: 1}); return}
            createToast("Conversation deleted!", 'success', 'success-del-room',{limit:1})
        }).catch( err => {
            console.log(err)
            createToast("Sorry! An error occured", 'error', 'error-del-room',{limit:1})
        })
        .finally(() => {
            // setDeletedRoom(null)
        })
    }

    const searchActiveChats = () => {
        if (!hasLoaded) return 
        if (search.length < 2) {
            setUserList(initialChats)
            return
        }
        const filteredChats = initialChats?.users.filter(ouser => ouser.username.toLowerCase().includes(search.toLowerCase() || ouser.name.toLowerCase().includes(search.toLowerCase())))
        setUserList({users: filteredChats})
}
    useDebounce(searchActiveChats, [search], 500)
      
    return (
        <div className='min-w-[450px] overflow-y-scroll no-scrollbar flex[1]'>
            <div className='taskbar flex flex-row items-center justify-between px-4 py-2 '>
                <p className='text-xl font-bold '>Messages</p>
                <div className='flex flex-row justify-center items-center'>
                    <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                        <FiSettings />
                    </Button>
                    <NavLink to='/messages/i/compose' state={{ background: location }}>
                        <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                            <BsEnvelopePlus />
                        </Button>
                    </NavLink>
                </div>
            </div>
            <div className={`py-2 px-4 mt-1 mb-1 relative`}>
        {/* <GoSearch className="text-slate-600" /> */}
        <CiSearch className="text-black absolute top-5 left-7" size={'16px'}/>
        
        <input
        autoComplete="off"
        name="search"
        placeholder="Search Direct Messages"
        onChange={(e) => setSearch(e.target.value.trim())}
        className="focus-within:border-slate-500  flex items-center justify-start rounded-full border border-gray bg-transparent w-full py-2 px-8 placeholder:text-gray-500 bg-slate-100 text-base"
        />
        </div>

        <div className='flex flex-col justify-between'>
            {loading ?
                <div className='flex items-center justify-center p-6'>
                    <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
                </div>
                :
                (
                   userList?.users?.length ?

                    userList.users.map((otherUser, index) => (
                        <NavLink key={index} to={`/messages/${otherUser.username}`} className='group user py-2'>
                            <UserBlock user={otherUser}>
                                <RoomDeletePopup room={evalRoom(user, otherUser)} user={user} otherUser={otherUser} handleDeleteRoom={handleDeleteRoom} />
                            </UserBlock>
                        </NavLink>
                        ))
                        :

                        <div className='flex flex-col gap-2 items-center justify-center'>
                        <h3>Try refining your search or Starting more chats </h3>
                            </div>
                        
                )
            }
        </div>
    </div>
    )
}

export default MessageList