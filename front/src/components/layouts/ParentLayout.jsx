import React, { useEffect } from 'react'
import SideNav from '../SideNav';
import { Outlet } from 'react-router-dom';
import { UserProvider } from '../../context/UserContext';
import { useDispatch } from 'react-redux';
import { fetchAllTweetsAsync } from '../../features/tweets/tweetSlice';



const ParentLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllTweetsAsync());
  }, [dispatch]);

  return (
    <UserProvider>
        <div className="main-container flex h-full w-full max-w-[1300px] mx-auto">
            <SideNav />
            <Outlet />
        </div>
    </UserProvider>

  )
}

export default ParentLayout