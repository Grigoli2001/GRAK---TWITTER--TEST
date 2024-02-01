import React, { useState } from 'react'
import { Button } from './Button'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import { Picker } from 'emoji-mart';
import SendMessage from './SendMessage';
import ReceiveMessage from './ReceiveMessage';
import { NavLink, useParams } from 'react-router-dom';

import '../styles/messages.css'
import { UserBlock } from './User';
import { users } from '../constants/feedTest';
import { FollowButton } from './FollowButton';
import { Switch } from '@material-tailwind/react';

const MessageInfo = () => {
    const [message, setMessage] = useState('')
    const params = useParams()

    const autoResize = (e) => {
        const textarea = e.target;

        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }


    return (
        <div className='h-screen sticky top-0 border-r border-r-gray-200 border-l border-r-gray-200  flex flex-col w-[250px] flex-[2]'>

            <div className='flex flex-col h-full relative'>
                <div className='msgtaskbar flex flex-row items-center bg-white w-[100%] sticky px-4 py-2 shadow-sm gap-3'>
                    <NavLink to={`/messages/${params.id}`} className='flex flex-row items-center justify-center gap-2'>
                    <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                        <IoMdArrowBack />
                    </Button>
                    </NavLink>
                    <p className='text-xl font-bold '>Conversation Info</p>
                </div>
                <div className='flex flex-col h-full overflow-x-hidden gap-3'>
                    <div className='flex flex-row items-center justify-between px-2 py-2'>
                        <UserBlock user={users[0]} />
                        <FollowButton followed={true} />
                    </div>
                    <div className='flex flex-col px-4 py-2 gap-5 border-y border-y-gray-200'>
                        <p className='text-xl font-bold '>Notifications</p>
                        <div className='flex flex-row justify-between'>
                            <p className='text-md'>Snooze notifications from {users[0].username}</p>

                            <Switch color='blue' />
                        </div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className='transition w-[100%] p-[10px] text-center hover:bg-blue-100'>
                        <p className='text-md text-twitter-blue'>Block @{users[0].username}</p>
                        </div>
                        <div className='transition w-[100%] p-[10px] text-center hover:bg-blue-100'>
                        <p className='text-md text-twitter-blue'>Report @{users[0].username}</p>
                        </div>
                        <div className='transition w-[100%] p-[10px] text-center hover:bg-blue-100'>
                        <p className='text-md text-twitter-blue'>Report conversation as EU illegal content</p>
                        </div>
                        <div className='transition w-[100%] p-[10px] text-center hover:bg-red-100'>
                        <p className='text-md text-red-400'>Leave Conversation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageInfo