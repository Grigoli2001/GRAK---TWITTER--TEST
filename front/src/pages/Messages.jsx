import React from 'react'
import MessageList from '../components/MessageList'
import MessageWindow from '../components/MessageWindow'

const Messages = () => {
  return (
    <div className='flex'>
      <MessageList />
      <MessageWindow />
    </div>
  )
}

export default Messages