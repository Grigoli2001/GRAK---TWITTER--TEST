import React from 'react'
import SideNav from '../SideNav';
import { Outlet } from 'react-router-dom';
import { UserProvider } from '../../context/testUserContext';

const ParentLayout = () => {
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