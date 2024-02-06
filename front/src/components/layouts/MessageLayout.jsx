import React from 'react'
import SideNav from '../../components/SideNav';
import { UserProvider } from '../../context/testUserContext';
import { Outlet } from 'react-router-dom';
import MessageList from '../MessageList';

const MessageLayout = (props) => {
  
  return (
    <UserProvider>
      <div className="flex h-full w-full max-w-[1300px] mx-auto">
          <SideNav />
          <div className='min-w-fit flex-1'>
              <MessageList />
          </div>
          <Outlet/>
      </div>
    </UserProvider>
  )
}

export default MessageLayout