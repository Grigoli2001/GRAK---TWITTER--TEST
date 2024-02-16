import { useContext, useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { BsEnvelopePlus } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";

import { UserBlock } from '../User';
import { users } from '../../constants/feedTest'
import '../../styles/messages.css'
import { FaEllipsis, FaCircleCheck } from 'react-icons/fa6';
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react'
import { UserContext } from '../../context/testUserContext';
import { evalRoom } from '../../utils/utils';
import instance from '../../constants/axios';
import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';


const MessageList = () => {
    const [userList, setUserList] = useState(users)
    const [deletedRoom, setDeletedRoom] = useState(null)
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const location = useLocation()

    const handleDeleteRoom = (room, otherUser) => {
        instance.delete('/messages/delete-room', {
                data: {
                    room_id: room
            }
        }).then(res => {
            if (res.status === 204) throw new Error('No changes made')
            setUserList(prevUsers => prevUsers.filter(ouser => ouser.id !== otherUser.id))
            setDeletedRoom(room)
            if (document.querySelector('.success-del-room')) return
            toast.success("Conversation deleted!", {
                position: "bottom-center",
                icon: <FaCircleCheck/>,
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: 'success-del-room !bg-twitter-blue !text-white',
            })

        }).catch( err => {
            console.log(err)
            if (document.querySelector('.error-del-room')) return // limit to one error toast
                toast.warn("Sorry! An error occured", {
                  position: "bottom-center",
                  icon: <FaExclamationCircle/>,
                  autoClose: 2000,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  className: 'error-del-room !bg-twitter-blue !text-white',
              });
        
        })
    }

    useEffect(() => {
        if (deletedRoom){
            if (userList.length === 0) {
            navigate('/messages')
            }else{
                navigate(`/messages/${userList[0].username}`)
                console.log(userList, 'full')
            }
        }
    }, [userList, deletedRoom])


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
        className="focus-within:border-slate-500  flex items-center justify-start rounded-full border border-gray bg-transparent w-full py-2 px-8 placeholder:text-gray-500 bg-slate-100 text-base"
        />

        </div>
            <div className='flex flex-col justify-between'>
                {userList.map((otherUser) => {
                    return (
                        <NavLink to={`/messages/${otherUser.username}`} className='group user py-2'>
                            <UserBlock key={otherUser.id} user={otherUser}>
                            <Popover placement='bottom-end' offset={{mainAxis: -50}}>
                                <PopoverHandler className='ml-auto mr-2'>
                                    <div>
                                        <Button tooltip="More" variant="icon" size="icon-sm" className="invisible group-hover:visible text-slate-800 p-2 cursor-pointer rounded-full hover:bg-twitter-blue/15 hover:text-twitter-blue">
                                            <FaEllipsis/>
                                        </Button>
                                 </div>
                            </PopoverHandler>
                                <PopoverContent className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10'>
                                    <ul className='list-none text-sm'>
                                        <li  onClick={() => {handleDeleteRoom(evalRoom(user, otherUser), otherUser)}} className='text-red-500 hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><RiDeleteBinLine className=""/> Delete conversation</li>
                                    </ul>
                                </PopoverContent>
                            </Popover>
                            </UserBlock>
                            
                        </NavLink>
                    )
                })}
               
            </div>

        </div>
    )
}

export default MessageList