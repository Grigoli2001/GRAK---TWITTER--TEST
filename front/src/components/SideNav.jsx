// React Imports
import { useContext, useState } from 'react'
import { showUsername } from '../utils/utils';
import { NavLink } from 'react-router-dom';

// icons
import { GoHomeFill, GoSearch } from "react-icons/go";
import { HiMiniBell } from "react-icons/hi2";
import { FaRegEnvelope, FaRegBookmark, FaEllipsis } from "react-icons/fa6";
import { IoPersonOutline, IoEllipsisHorizontalCircle } from "react-icons/io5";
import { BsTwitterX } from "react-icons/bs";
import { FaPeopleLine } from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";

// Components
import { Button } from "./Button";
import { UserBlock }  from './User';
import MiniDialog from './MiniDialog';

import '../styles/SideNavExtra.css'

// Testing
import { UserContext } from '../context/testUserContext';

const SideNavTab = ({ text, icon, notif, url}) => {

    return (
        <li>
            <NavLink to={url}
            className={`group w-fit flex items-center justify-start text-xl p-4 bg-white rounded-full hover:bg-slate-200 transition-colors duration-100 cursor-pointer`}>
                <span className="text-black mx-4 relative group-[.active]:font-bold group-[.actvie]:text-lg"> 
                    { icon }
                    { notif > 0 && <span className="absolute -top-2 -left-1 bg-twitter-blue rounded-full text-white text-xs px-1">{ notif }</span> }
                </span>
                <span className="pr-4 group-[.active]:font-bold">{ text }</span>
            </NavLink>
        </li>
    )
}

const ProfileTab = ({user}) => {
    return (

        <MiniDialog>

            <MiniDialog.Wrapper className="rounded-full text-xl flex items-center text-black gap-x-3 mt-auto hover:bg-slate-200 p-3 cursor-pointer">
                
                <MiniDialog.Dialog  className="speech-bubble !px-0 w-full bg-white rounded-xl shadow-all-round font-bold !outline-none">
                    <ul className="list-none">
                        <li className="hover:bg-slate-200/50 p-2 cursor-pointer">Add an existing account</li>
                        <li className="hover:bg-slate-200/50 p-2 cursor-pointer">Logout {showUsername(user)} </li>
                    </ul>
                </MiniDialog.Dialog>

                    <UserBlock user={user} size="sm"/>
                
                <FaEllipsis className='ml-auto mr-4' />

            </MiniDialog.Wrapper>

        </MiniDialog>
    )
}

const SideNav = () => {

    const{ user }= useContext(UserContext)

    // options for side nav for ui purposes only: TODO: will update to use Tab Nav
let options = [

    {
        title: 'Home', 
        icon: <GoHomeFill/>,
        url: '/home'
    }, 
    {
        title: 'Explore', 
        icon: <GoSearch/>,
        url: '/explore', 
    }, 
    {
        title: 'Notifications', 
        icon: <HiMiniBell/>,
        url: '/notifications'
    }, 
    {
        title: 'Messages', 
        icon: <FaRegEnvelope/>,
        url: '/messages'
    }, 
    {
        title: 'Bookmarks', 
        icon: <FaRegBookmark/>,
        url: '/bookmarks'
    }, 
    {
        title: 'Profile', 
        icon: <IoPersonOutline/>,
        url:`/${user.username}`
    }, 
]
    return (
        <div className="h-screen sticky top-0 border-r border-r-gray-200 p-4 flex flex-col min-w-[250px] flex-[0.3]">
            <nav>
                <NavLink to='/home'>
                    <BsTwitterX className="text-4xl ml-8" />
                </NavLink>
                <ul className="list-none">
                    {/* TODO dont use map and use notifs as state */}
                    {
                        options.map((option, index) => {
                            return <SideNavTab key={index} text={option.title} icon={option.icon} notif={0} url={option.url }/>
                        })
                    }

                    <li>

                        <MiniDialog>
                            <MiniDialog.Wrapper className={`w-fit flex items-center justify-start text-xl p-4 bg-white rounded-full hover:bg-slate-200 transition-colors duration-100 cursor-pointer`}>
                                <span className="text-black mx-4 relative"> 
                                    <IoEllipsisHorizontalCircle/>
                                </span>
                                <span className="pr-4"> More </span>
                                <MiniDialog.Dialog className='absolute bottom-[90%] w-fit bg-white rounded-xl shadow-all-round font-bold text-lg !outline-none z-10'>
                                    <ul className='list-none'>
                                        <li className='hover:bg-slate-200/50 p-4 cursor-pointer flex items-center gap-2 whitespace-nowrap'><FaPeopleLine/> More About Us</li>
                                        <li className='hover:bg-slate-200/50 p-4 cursor-pointer flex items-center gap-2 whitespace-nowrap'>< FiSettings/> Settings and Privacy</li>
                                    </ul>
                                </MiniDialog.Dialog>
                            </MiniDialog.Wrapper>
                        </MiniDialog>
                      
                    </li>

                </ul>
            </nav>

            <Button size="lg">Post</Button>

            <ProfileTab user={user}/>
        </div>
        
        
    )
}

export default SideNav