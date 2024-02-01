import React, {useEffect, useState} from 'react'
import { Button } from './Button'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import { Picker } from 'emoji-mart';
import SendMessage from './SendMessage';
import ReceiveMessage from './ReceiveMessage';
import { NavLink, useParams } from 'react-router-dom';

import '../styles/messages.css'

const MessageWindow = () => {
    const [message, setMessage] = useState('')
    const id = useParams().id

    useEffect(() => {
        const messageHistory = document.querySelector('.message-history');
        if(messageHistory){
        messageHistory.scrollTop = messageHistory.scrollHeight;
        }

    }, [id])

    const autoResize = (e) => {
        const textarea = e.target;

        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }


    return (
        <div className='h-screen sticky top-0 border-r border-r-gray-200 border-l border-r-gray-200  flex flex-col w-[250px] flex-[2]'>

{!id ? (
            <div className='flex flex-col items-center justify-center h-full'>

        <div className='w-[300px] flex flex-col justify-between min-h-[170px]'>
          <p className='text-4xl font-bold'>Select a Message</p>
          <p className='text-gray-600 text-sm'>Choose from your existing conversations, start a new one, or just keep swimming.</p>
          <Button size="md">New Message</Button>
          </div>
        </div>) : 
            <div className='flex flex-col h-full relative'>
                <div className='msgtaskbar flex flex-row items-center bg-white w-[100%] absolute top-0 justify-between px-4 py-2 shadow-sm'>
                    <p className='text-xl font-bold '>{id}</p>
                    <div className='flex flex-row justify-center items-center'>
                        <NavLink to={`/messages/${id}/info`} className='flex flex-row items-center justify-center gap-2'>
                        <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                            <AiOutlineInfoCircle />
                        </Button>
                    </NavLink>
                    </div>
                </div>

                <div className='message-history flex flex-col h-full overflow-y-scroll overflow-x-hidden px-4 gap-3'>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>

                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'}/>
                    <ReceiveMessage  message={'heyy'}/>
                    <SendMessage  message={'heyy'} isLastMessage={true}/>
                    <ReceiveMessage  message={'heyy'} isLastMessage={true}/>

                    {/* Actual logic after api */}
                    {/* {messages.map((msg, index) => (
    <SendMessage key={index} message={msg.text} isLastMessage={index === messages.length - 1} />

    // <ReceiveMessage key={index} message={msg.text} isLastMessage={index === messages.length - 1} />
  ))} */}

                </div>
                <div className='flex flex-col sticky bottom-0 bg-white h-fit px-4 py-1'>
                        <div className='bg-gray-100 rounded-[16px] w-full  outline-none px-4'>
                        <div className='flex flex-row justify-between items-center'>
                            <div className=''>
                            <Button variant="icon" size="icon-sm" className="pointer-events-auto">
                                <label htmlFor="msg_media">
                                    <GrImage title="Media" />
                                    <input id="msg_media" name="msg_media" className="hidden" type="file" accept="image/*, video/*" />
                                </label>
                            </Button>


                            <Button variant="icon" size="icon-sm">
                                <label htmlFor="msg_gif">
                                    <MdOutlineGifBox title="GIF" />
                                </label>
                                <input id="msg_gif" name="msg_gif" className="hidden" type="file" accept="image/gif" />
                            </Button>

                            <Button variant="icon" size="icon-sm">
                                <label htmlFor="msg_emoji">
                                    <BsEmojiSmile title="Emoji" />
                                </label>
                                <input id="msg_emoji" name="msg_emoji" className="hidden" type="file" accept="image/gif" />
                            </Button>

                            </div>
                            <textarea  placeholder='Start a new message' id="textbox" onInput={autoResize} value={message} className='flex-3 bg-gray-100 rounded-full px-4 py-2 outline-none w-[370px] resize-none h-[40px]' rows={1} onChange={(e) => setMessage(e.target.value)}/>

                            <Button variant="icon" size="icon-sm" disabled={ message ? false : true}>
                                <AiOutlineSend />
                            </Button>
                        </div>
                        </div>
                </div>
                </div>}
        </div>
    )
}

export default MessageWindow