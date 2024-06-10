import { forwardRef, useState } from 'react';
import { cn } from '../../utils/style'
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react'
import { FaCircleCheck, FaEllipsis } from 'react-icons/fa6';
import { RiDeleteBinLine, RiDeleteBin2Fill } from "react-icons/ri";
import { CIAddSquare } from '../customIcons';
import { Button } from '../Button';
import { createToast } from '../../hooks/createToast';

export const Typing  = () => {  

  return (
    <div className='w-fit h-4 bg-gray-100 rounded-3xl p-3 flex gap-x-1 items-center'>
      <div className='tdot w-2 h-2 rounded-full bg-gray-400 bg-opacity-100'></div>
      <div className='tdot w-2 h-2 rounded-full bg-gray-400 bg-opacity-100'></div>
      <div className='tdot w-2 h-2 rounded-full bg-gray-400 bg-opacity-100'></div>
      <div className=''></div>
    </div>
  )
}

// messageType either sent or received
const Message = forwardRef(({ message, messageType, isLastMessage,  handleModalOpen }, ref) => {

  const [showMore, setShowMore] = useState(false)

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.message)
    setShowMore(false)
    createToast(
      "Message copied to clipboard!", 
      'success', 
      'copy-msg-success', 
      {limit: 1})
  }

  return (

<>

    <div ref={ref} className={cn('w-full group flex flex-col',{
      'last-message': isLastMessage
    })}>

        <div className={cn('flex items-center justify-end',{
          'flex-row-reverse': messageType === 'received',
        })}>

        {
         !message.is_deleted_for_everyone &&
          <Popover open={showMore} handler={setShowMore} placement={ messageType==='received' ? 'left': 'right'} offset={{ mainAxis: messageType==='received' ? -100: -50}}>
              <PopoverHandler className=''>
                <div>
                  <Button tooltip="More" variant="icon" size="icon-sm" className="invisible group-hover:visible text-slate-800 p-2 cursor-pointer rounded-full hover:bg-twitter-blue/15 hover:text-twitter-blue">
                    <FaEllipsis/>
                  </Button>
                </div>
              </PopoverHandler>
              <PopoverContent className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10'>
                  <ul className='list-none text-sm'>
                    
                      <li onClick={handleCopyMessage} className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIAddSquare/> Copy this message</li>
                      <li  onClick={() => {handleModalOpen(message.message_id); setShowMore(false)}} className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><RiDeleteBinLine className="text-2xl"/> Delete for you</li>
                      
                      {/* message still in redis then del for everyone:  since back is set to experire after 20 we set this to 15 to be safe minute
                      so user has 15 minutes to delete message for everyone 
                      */}
                      {new Date(message.date) > new Date() - 1000 * 60 * 15  && messageType === 'sent' && 
                        <li onClick={() => {handleModalOpen(message.message_id, true); setShowMore(false)}} className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'>
                          <RiDeleteBin2Fill className="text-2xl"/> Delete for everyone </li>
                      }
                  </ul>
              </PopoverContent>
            </Popover>
      }


            <div
              className={cn('rounded-3xl py-3 w-fit px-4 max-w-[75%] break-all', {
                'bg-twitter-blue text-white': messageType === 'sent' && !message.is_deleted_for_everyone,
                'bg-gray-100': messageType === 'received' && !message.is_deleted_for_everyone,
                'rounded-br-none': isLastMessage && messageType === 'sent',
                'rounded-bl-none': isLastMessage && messageType === 'received',
                'bg-blue-gray-100 bg-opacity-50 text-gray-400': message.is_deleted_for_everyone,
                
              })}
            >
              <p className='text-wrap'>{message.message }</p> 
            </div>
      </div>
      


      {
          isLastMessage && 
              <p className={cn('text-xs text-gray opacity-50',{
                'self-end': messageType === 'sent',
                'self-start': messageType === 'received',
              } 
              
              )}>
                { 
                  new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  }).format(new Date(message.date)) 
                }
              </p>
          }
    </div>

    </>

  );
});

export default Message;
