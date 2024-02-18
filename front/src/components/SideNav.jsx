// React Imports
import { useContext, useEffect, useState } from "react";
import { showUsername } from "../utils/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { UserBlock } from "./User";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import "../styles/SideNavExtra.css";

import { cn } from "../utils/style";

// context
import { SocketContext } from "../context/socketContext";
import useUserContext from "../hooks/useUserContext";

const SideNavTab = ({ text, icon, notif, url }) => {
    return (
        <li>
            <NavLink
        to={url}
            className={`group w-fit flex items-center justify-start text-xl p-4 bg-white rounded-full hover:bg-slate-200 transition-colors duration-100 cursor-pointer`}
      >
        <span className="text-black mx-4 relative group-[.active]:font-bold group-[.actvie]:text-lg">
          {icon}
          {
          (notif && notif.value > 0) && 
            <span 
            className={cn('absolute -top-2 left-[50%] bg-twitter-blue rounded-full text-white text-xs px-1',{
              'animate-pulse py-1': notif.type ==='indicator'
            })}>
              { notif.type !== "indicator" && 
                notif.value > 99 ? '99+' : notif.value 
              }
            </span> 
          }
        </span>
        <span className="pr-4 group-[.active]:font-bold">{text}</span>
            </NavLink>
        </li>
    );
};

export const ProfileTab = () => {
// I added logout because I need for testing
  const { dispatch } = useUserContext();
  const { user, token, isAuthenticated} = useUserContext();
  console.log(user, 'user in profiletab')
  console.log(token,  'token in profiletab')
  console.log(isAuthenticated, 'isAuthenticated in profiletab')
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch({
      type: "Logout",
    });
    navigate("/");
  };
    return (
<Popover>
      <PopoverHandler className="rounded-full text-xl flex items-center text-black gap-x-3 mt-auto hover:bg-slate-200 p-3 cursor-pointer">
                <div>
          <UserBlock user={user} size="sm" />
          <FaEllipsis className="min-w-4 ml-auto mr-2" />
        </div>
      </PopoverHandler>

      <PopoverContent className="!p-0 !shadow-all-round text-black">
        <div className="speech-bubble !px-0 bg-white rounded-xl font-bold !outline-none text-lg">
                    <ul className="list-none">
                        <li className="hover:bg-slate-200/50 p-2 cursor-pointer">
              Add an existing account
            </li>
                        <li
              onClick={handleLogout}
              className="hover:bg-slate-200/50 p-2 cursor-pointer"
            >
              Logout {showUsername(user)}
            </li>
                    </ul>
                </div>
      </PopoverContent>
    </Popover>
  );
};

const SideNav = () => {
  const { user } = useUserContext();
  const { socket } = useContext(SocketContext)
  const location = useLocation();
  const [ options, setOptions ] = useState([
    {
      title: "Home",
      icon: <GoHomeFill />,
      url: "/home",
      notif: {
        type: 'indicator',
        value: 0
      }
    },
    {
      title: "Explore",
      icon: <GoSearch />,
      url: "/explore",
      notif: {
        type: 'count',
        value: 0
      }
    },
    {
      title: "Notifications",
      icon: <HiMiniBell />,
      url: "/notifications",
      notif: {
        type: 'count',
        value: 0
      }
    },
    {
      title: "Messages",
      icon: <FaRegEnvelope />,
      url: "/messages",
      notif: {
        type: 'count',
        value: 0
      }
    },
    {
      title: "Bookmarks",
      icon: <FaRegBookmark />,
      url: "/bookmarks",
      notif: {
        type: 'count',
        value: 0
      }
    },
    {
      title: "Profile",
      icon: <IoPersonOutline />,
      url: `/${user.username}`,
      notif: {
        type: 'count',
        value: 0
      }
    },
  ])

  useEffect(() => {
    

    const handleNewNotification = (notif) => {
      
       console.log('new notification', notif)
      const newOptions = options.map(option => {
        if (option.title === notif.title) {
          return {
            ...option,
            notif: {
              ...option.notif,
              value: option.notif.value += 1
            }
          }
        }
        return option
      })
      setOptions(newOptions)
    }
    socket?.on('notification:new', handleNewNotification)

    return () => {
      socket?.off('notification:new', handleNewNotification)
    }
  }, [socket]);

  return (
    <div className="h-screen sticky top-0 border-r border-r-gray-200 p-4 flex flex-1 flex-col max-w-[275px]">
      <nav>
        <NavLink to="/home" className="">
          <Button variant="icon" className="text-4xl ml-5 p-3 rounded-full hover:bg-slate-200 text-black">
            <BsTwitterX className="" />
          </Button>
        </NavLink>
        <ul className="list-none">
          {/* TODO dont use map and use notifs as state */}
          {options.map((option, index) => {
            return (
              <SideNavTab
                key={index}
                text={option.title}
                icon={option.icon}
                notif={option.notif}
                url={option.url}
              />
                        );
          })}

                    <li>
              <Popover
              placement="top-start"
              offset={{
                mainAxis: -75,
              }}
              animate={{
                mount: { scale: 1, y: -10 },
                unmount: { scale: 0, y: 25 },
              }}
            >
                            <PopoverHandler
                className={`w-fit flex items-center justify-start text-xl p-4 bg-white rounded-full hover:bg-slate-200 transition-colors duration-100 cursor-pointer`}
              >
                <div>
                                <span className="text-black mx-4 relative"> 
                                    <IoEllipsisHorizontalCircle />
                                </span>
                                <span className="pr-4"> More </span>
                                </div>
              </PopoverHandler>

              <PopoverContent className="p-0 text-black w-fit border-none bg-white rounded-xl !shadow-all-round font-bold text-lg !outline-none z-10 overflow-hidden">
                                    <ul className="list-none">
                                        <li className="hover:bg-slate-200/50 p-4 cursor-pointer flex items-center gap-2 whitespace-nowrap">
                    <FaPeopleLine /> More About Us
                  </li>
                  <NavLink
                    to={"/settings"}
                    className={"!border-none !outline-none"}
                  >
                                        <li className="hover:bg-slate-200/50 p-4 cursor-pointer flex items-center gap-2 whitespace-nowrap  ">
                                                <FiSettings /> Settings and Privacy
                                                                </li>
              </NavLink>
                </ul>
              </PopoverContent>
            </Popover>
          </li>
                </ul>
            </nav>

            <NavLink to="/compose/tweet" state={{ background: location }} className="my-3 w-full flex">
             <Button size="lg" className="w-full">Post</Button>
            </NavLink>

            <ProfileTab/>
        </div>
);
};
        
export default SideNav;
        