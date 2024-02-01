import React, {useEffect, useState} from 'react'
import { Button } from '../components/Button'
import { BsEnvelopePlus } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import SearchBar from '../components/SearchBar';
import { UserBlock } from '../components/User';
import { users } from '../constants/feedTest'
import { NavLink } from 'react-router-dom';

import '../styles/messages.css'

const MessageList = () => {
    const [chat, setChat] = useState(null)

    return (
        <div className='min-w-[450px] overflow-y-scroll no-scrollbar flex[1]'>
            <div className='taskbar flex flex-row items-center justify-between px-4 py-2 '>
                <p className='text-xl font-bold '>Messages</p>
                <div className='flex flex-row justify-center items-center'>
                    <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                        <FiSettings />
                    </Button>
                    <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                        <BsEnvelopePlus />
                    </Button>
                </div>
            </div>
            <div className={`py-2 px-4 mt-1 mb-1 relative`}>
        {/* <GoSearch className="text-slate-600" /> */}
        <CiSearch className="text-black absolute top-5 left-7" size={'16px'}/>
        
        <input
        autoComplete="off"
        name="search"
        placeholder="Search Direct Messages"
        className="focus-within:border-slate-500 w-full flex items-center justify-start rounded-full border border-gray bg-transparent w-full py-2 px-8 placeholder:text-gray-500 bg-slate-100 text-[15px]"
        />

        </div>
            <div className='flex flex-col justify-between'>
                {users.map((user) => {
                    return (
                        <NavLink to={`/messages/${user.username}`} className='user py-2'>
                        <UserBlock key={user.id} user={user} />
                        </NavLink>
                    )
                })}
               
            </div>

        </div>
    )
}

export default MessageList