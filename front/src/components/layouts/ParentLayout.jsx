import React, { useEffect } from 'react'
import SideNav from '../SideNav';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchAllTweetsAsync } from '../../features/tweets/tweetSlice';



const ParentLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllTweetsAsync());
  }, [dispatch]);

  return (
        <div className="main-container flex h-full w-full max-w-[1300px] mx-auto">
            <SideNav />
            <Outlet />
        </div>

  )
}

export default ParentLayout