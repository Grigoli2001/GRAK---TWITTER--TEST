import React from 'react'
import { Button } from '../components/Button'
import { BsEnvelopePlus } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import SearchBar from '../components/SearchBar';

const Messages = () => {
  return (
    <div className='flex flex-row h-full'>
      <div className='w-1/2'>
        <div className='taskbar flex flex-row items-center justify-between px-4 py-2 border-b border-gray-200'>
          <p className='text-xl font-bold h-full'>Messages</p>
          <div className='flex flex-row justify-center items-center'>
            <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
              <FiSettings />
            </Button>
            <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
              <BsEnvelopePlus />
            </Button>
          </div>
        </div>
        <div className='flex flex-col items-center my-[20px] h-full'>
          <SearchBar />
        </div>
        
      </div>
      <div className='w-1/2 border-l border-gray-200'>
      <div className='flex flex-col items-center justify-center h-full'>
          <p className='text-2xl font-bold'>You don't have a message selected</p>
          <p className='text-xl'>Choose one from your existing messages, or start a new one.</p>
        </div>
      </div>
    </div>
  )
}

export default Messages