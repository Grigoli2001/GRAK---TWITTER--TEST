// React Imports
import { useContext, useEffect, useState } from "react";
import { showUsername } from "../utils/utils";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {selectNotif, addNotif, removeNotif,} from '../features/tweets/navNotifSlice'
// icons
import { GoHomeFill, GoSearch } from "react-icons/go";
import { HiMiniBell, HiBell } from "react-icons/hi2";
import { FaRegEnvelope, FaRegBookmark, FaBookmark, FaEllipsis, FaEnvelope } from "react-icons/fa6";
import { IoPersonOutline, IoEllipsisHorizontalCircle, IoPerson } from "react-icons/io5";
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
import { FaSearch } from "react-icons/fa";
import instance from "../constants/axios";
import { requests } from "../constants/requests";

const SideNavTab = ({ text, icon, activeIcon, url, type }) => {

  const reduxDispatch = useDispatch()
  const value = useSelector(selectNotif(text.toLowerCase()))
  const location = useLocation();
  const activeIconResolve = activeIcon ?? icon
  const removeNotifHandler = () => {
      reduxDispatch(removeNotif({ category: text.toLowerCase()}))
  }
    return (
        <li onClick={removeNotifHandler}>
            <NavLink
              to={url}
              className={`group w-fit flex items-center justify-start text-xl p-4 bg-white rounded-full hover:bg-slate-200 transition-colors duration-100 cursor-pointer`}
            >
        <span className="text-black mx-4 relative group-[.active]:font-bold group-[.actvie]:text-lg">
          { location.pathname === url ? activeIconResolve : icon }
          {
          value > 0 && 
            <span 
            className={cn('absolute -top-2 left-[50%] bg-twitter-blue rounded-full text-white text-xs px-1',{
              'animate-pulse py-1': type ==='indicator'
            })}>

              {
                type === 'indicator' ? null :
                value > 99 ? '99+' : value
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
  const { dispatch } = useUserContext();
  const { user } = useUserContext();

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


let options = {
  home: {
    title: "Home",
    icon: <GoHomeFill />,
    activeIcon: <GoHomeFill className="text-2xl" />,
    url: "/home",
    type: "indicator",  
  },
  explore: {
    title: "Explore",
    icon: <GoSearch />,
    activeIcon: <FaSearch className="text-2xl" />,
    url: "/explore",
    type: "count",
  },
  notifications: {
    title: "Notifications",
    icon: <HiMiniBell />,
    activeIcon: <HiBell className="text-2xl" />,
    url: "/notifications",
    type: "count",
  },
  messages: {
    title: "Messages",
    icon: <FaRegEnvelope />,
    activeIcon: <FaEnvelope className="text-2xl" />,
    url: "/messages",
    type: "count",
  },
  bookmarks: {
    title: "Bookmarks",
    icon: <FaRegBookmark />,
    activeIcon: <FaBookmark className="!text-xl" />,
    url: "/bookmarks",
    type: "count",
  },
  profile: {
    title: "Profile",
    icon: <IoPersonOutline />,
    activeIcon: <IoPerson className="!text-2xl" />,
    type: "count",
  },

};


const SideNav = () => {
  const { user, dispatch } = useUserContext();
  const { socket } = useContext(SocketContext)
  const location = useLocation();
  const [openMore, setOpenMore] = useState(false)
  const reduxDispatch = useDispatch()

  // TODO Add loading
  useEffect(() => {
    // get initial username should only run once on mount
    console.log('getting user side nav')
    instance.get(requests.getUser, {
      params: {
        id: user?.id
      }
    }).then((res) => {
      console.log(res.data)
      if (!res.data.user?.username) {
        return
      }
      dispatch({
        type: "UPDATE",
        payload: res.data.user
      })
      
    })
    .catch((err) => {
      console.log(err)
    })

    }, [user.username])

  useEffect(() => {
    options = {
      ...options,
      profile: {
        ...options.profile,
        url: `/${user?.username}`
      }
    }
  }, [user?.username])
  

  useEffect(() => {
    const handleNewNotification = (notif) => {
      console.log('nav notif new received', notif)
      reduxDispatch(addNotif({ notif }))
    }
    socket?.on('nav:notif:new', handleNewNotification)

    return () => {
      socket?.off('nav:notif:new', handleNewNotification)
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
          {Object.keys(options).map((option, index) => {
            return (
              <SideNavTab
                key={index}
                text={options[option].title}
                icon={options[option].icon}
                activeIcon={options[option].activeIcon}
                type={options[option].type}
                url={options[option].url}
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
              handler={setOpenMore}
              open={openMore}
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

              <PopoverContent 
              onClick={() => setOpenMore(false)}
              className="p-0 text-black w-fit border-none bg-white rounded-xl !shadow-all-round font-bold text-lg !outline-none z-10 overflow-hidden">
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
        