import React from 'react'
import { Outlet } from 'react-router-dom';
import MessageList from '../messages/MessageList';

const MessageLayout = (props) => {
  
  return (
    <>
          <div className='min-w-fit flex-1'>
              <MessageList />
          </div>
          <Outlet/>
    </>
  )
}

export default MessageLayout