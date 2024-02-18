import  {useEffect, useState, useContext, useRef, useCallback, useLayoutEffect} from 'react'
import {  Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../Button'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import Message, { Typing } from './Message';
import { NavLink, useParams } from 'react-router-dom';

import '../../styles/messages.css'
import { ExtAvatar } from '../User';
import { UserContext } from '../../context/testUserContext'
import { users } from '../../constants/feedTest';
import { evalRoom, showUsername } from '../../utils/utils';
import { SocketContext } from '../../context/socketContext';
import { Spinner } from "@material-tailwind/react";
import instance from '../../constants/axios'
import  Picker  from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import { Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react';
import { DefaultModal as Modal } from '../NavModal'
import { createToast } from '../../hooks/createToast';


const MessageWindowWrapper = ({children}) => {
    return (
        <div className='h-screen sticky top-0 border-r border-l border-r-gray-200  flex flex-col w-[250px] flex-[2]'>
            {children}
        </div>
    )
}

export const DefaultMessageWindow = () => {
    return (

            <>
            <MessageWindowWrapper>
                <div className='flex flex-col items-center justify-center h-full'>
                    <div className='w-[300px] flex flex-col justify-between min-h-[170px]'>
                    <p className='text-4xl font-bold'>Select a Message</p>
                    <p className='text-gray-600 text-sm'>Choose from your existing conversations, start a new one, or just keep swimming.</p>
                    
                    <NavLink to='/messages/i/compose' className='w-full'>
                        <Button size="md" className="w-full">New Message</Button>
                    </NavLink>
                    </div>
                </div>
            </MessageWindowWrapper>
            <Outlet />
            </>
    )

}

export const MessageWindow = () => {

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserContext)
    const { username } = useParams()
    const navigate = useNavigate()
    
    const [ chatTo, setChatTo] = useState(null)   
    const [ room , setRoom ] = useState(null)

    // messages and chatting to
    const [message, setMessage] = useState('')

    const messageWindowRef = useRef(null)
    const [page, setPage] = useState(0)

    const observer = useRef()
    const [otherIsTyping, setOtherIsTyping] = useState(false)
    const typingTimeoutRef = useRef(null)

    const [messages, setMessages] = useState([])
    const [windowLoaded, setWindowLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [ hasMore, setHasMore] = useState(false)

    // picker states
    const [showPicker, setShowPicker] = useState(false)
    const [newMessage, setNewMessage] = useState(false)

    // get last message sent and received
    const [ lastSent, setLastSent ] = useState(null)
    const [ lastReceived, setLastReceived ] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [messageToDelete, setMessageToDelete] = useState(null)


    // check if a user is found and join the room when component mounts
    useEffect(() => {

        // TODO replace with api call to find a user
        const chatTo = users.find(user => user.username === username)
        const returnToMessages = () => {navigate('/messages')}

        if (!chatTo){
            returnToMessages()
            return
        } 

        setChatTo(chatTo)
        setMessages([])
        setPage(0)
        setWindowLoaded(true)
        const room = evalRoom(user, chatTo)
        setRoom(room)
        socket.emit('message:join_room', { room } )
        
    }, [username, navigate])
   
    useEffect(() => {
        // if there's no room, don't fetch messages
        if (!room) return
        // set loading and error states for fetching messages
        setLoading(true)
        // fetch messages
        instance.get(`/messages/${room}`, {
            // headers: '',
            params: {
            page: page,
            }
        })
        .then(res => {
            setMessages(prevMessages => [...prevMessages, ...res.data?.messages, ])
            setHasMore(res.data.messages.length > 0)
            if (page === 0) {
                setNewMessage(!newMessage)
            }
        })
        .catch (err => {
            let className = 'error-load-messages'
            if (document.querySelector(`${className}`)) return // limit to one error toast
            createToast("Sorry! An error occured", 'error', className)
            }
        )
        .finally(() => setLoading(false))

  }, [room, page])

    useEffect(() => {
    if (messages?.length){
        setLastSent(messages.find(msg => msg.sender_id === user.id))
        setLastReceived(messages.find(msg => msg.sender_id !== user.id))
    }
    }, [messages])

    const scrollToBottom = useCallback(() => { 
        messageWindowRef.current?.scrollTo({ top: messageWindowRef?.current.scrollHeight, behavior: 'instant' })
    }, [messageWindowRef.current])

    useEffect(() => {
        scrollToBottom()
    }, [newMessage])

    const earliestMessage = useCallback(firstMessage => {

        if (loading) return
        if (observer.current) observer.current.disconnect()


        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore){
                setPage(prevPage => prevPage + 1)
            }
        }, 
        {
            root: messageWindowRef.current,
            rootMargin: "50px",
            threshold:1,
        }
        )
        if (firstMessage) observer.current.observe(firstMessage)
    }, [loading, hasMore])


    // SOCKETS
    // listen for new messages
    useEffect(() => {

        function handleReceived(msg) { 
            console.log('received message', msg)
            setMessages(prevMessages => [ msg, ...prevMessages ])
            setNewMessage(!newMessage)
        }

        socket?.on('message:received_message', handleReceived)

        return () => {
            socket?.off('message:received_message', handleReceived)
        }

    }, [socket])

    useEffect(() => {   
        // listen for typing
        socket.on('message:typing', (data) => {
            // don't show typing if it's the current user
            if (data.user === user.id) return
            setOtherIsTyping(true)
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
                setOtherIsTyping(false)
            }, 3000)
        })
            
        return () => {
            // console.log('cleaning up event listeners for typing')
            socket.off('message:typing')
        }
    }, [socket])

    useEffect(() => {
        const handleSendError = (error) => {
            createToast("Failed to send message!", 'error', 'error-send-message', { limit : 1})
        }
        socket.on('message:error_send_message', handleSendError)
        return () => {
            // console.log('cleaning up event listeners for error_sending_message')
            socket.off('message:error_send_message', handleSendError)
        }
    }, [socket])

    // HANDLERS
    // send new messags
    const handleSend = (e) => {
        
        if (e.keyCode===13 && !e.shiftKey || e.type === 'submit'){
            e.preventDefault();
            if (message.trim()){
                const msgObj = {message, sender_id: user.id, receiver_id: chatTo.id, room: room, date: new Date()}
                socket.emit('message:send_message', msgObj)
                // setMessages([ ...messages, msgObj,])
                setMessage('')
                setNewMessage(!newMessage)
            }
        }else{
            socket.emit('message:typing', {room, user: user.id})
        }
    }

    const handleModalOpen = (msg_id) => {
        setMessageToDelete(msg_id)
        setModalOpen(true)
    }

    const handleDeleteMessage = (msg_id) => {
        instance.delete('/messages/delete-message', {
            data:{
                msg_id
            } 
        }).then(res => {
            if (res.status === 204) throw new Error('Failed to delete message')
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== msg_id))
            createToast("Message deleted!", 'success', 'success-del-message', {limit: 1})
        })
        .catch(err => {
            createToast("Failed to delete message!", 'error', 'error-del-message', {limit: 1})
        }).finally(() => setModalOpen(false))
    }


    return (

        !windowLoaded ? 
        <MessageWindowWrapper>
            <div className='flex items-center justify-center w-full h-full'>
                <Spinner color="blue" className="h-10 w-10" />
            </div>
        </MessageWindowWrapper>

        :
        <>

            <Modal open={modalOpen} handleBackClick={() => setModalOpen(false)}>
                <div className='p-4 flex flex-col bg-white rounded-xl gap-y-2'>
                    <h1 className='text-xl font-bold'>Delete message</h1>
                    <p className='text-gray-600'>Are you sure you want to delete this message?</p>
                    <Button onClick={() => handleDeleteMessage(messageToDelete)} variant='outline' className='w-fit bg-red-500 self-center'>Delete</Button>
                    <Button onClick={() => setModalOpen(false)} variant='outlined' className='w-fit self-center'>Cancel</Button>
                </div>
            </Modal>

            <MessageWindowWrapper>
                <div className='flex flex-col h-full relative'>

                    <div className='msgtaskbar flex flex-row items-center bg-white w-[100%] absolute top-0 justify-between px-4 py-2 shadow-sm z-[2]'>
                        <p className='text-xl font-bold '>{chatTo?.username}</p>
                        <div className='flex flex-row justify-center items-center'>
                            <NavLink to={`/messages/${chatTo?.username}/info`} className='flex flex-row items-center justify-center gap-2'>
                            <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                                <AiOutlineInfoCircle />
                            </Button>
                        </NavLink>
                        </div>
                    </div>

                    <div ref={messageWindowRef} className='message-history flex flex-col-reverse h-full overflow-y-auto overflow-x-hidden px-4 z-1 gap-y-2'>
                        <div className='mt-auto'></div>

                        
                    { otherIsTyping && <Typing /> }
                       
                        {
                             
                            messages?.map((msg, index, arr) => {
                            return(
                                <Message 
                                {...(index === arr.length - 1 && {ref: earliestMessage})}
                                key={index} 
                                message={msg} 
                                messageType={msg.sender_id === user.id ? 'sent' : 'received'} 
                                isLastMessage={msg._id === lastSent?._id || msg._id === lastReceived?._id}
                                handleDeleteMessage={handleDeleteMessage}
                                handleModalOpen={handleModalOpen}
                                />)
                            }
            
                        )}


                        
                        { 
                            loading && 
                                <div className='flex items-center justify-center w-full p-6'>
                                    <Spinner color="blue" className="h-10 w-10" />
                                </div>
                        }

                        <div className="flex flex-col items-center justify-center pt-20 pb-8 mx-auto text-sm border-b border-b-gray-200 w-full">
                            <ExtAvatar size="lg" src={chatTo?.avatar} />
                            <p className='font-bold'>{chatTo?.name}</p>
                            <p>{showUsername(chatTo)}</p>
                            <p>Joined {new Date(chatTo?.join_date).toLocaleDateString('en-US', {month: 'long' , year: 'numeric'})}</p>
                        </div>


                    </div>


                    <form className='flex flex-col sticky bottom-0 bg-white h-fit px-4 py-1 border-t border-t-gray-100' onSubmit={handleSend}>
                            <div className='bg-gray-100 rounded-2xl w-full  outline-none px-4 py-1'>
                                <div className='flex flex-row justify-between items-center flex-nowrap'>

                                    <Button variant="icon" size="icon-sm" tooltip="Media" className="pointer-events-auto">
                                        <label htmlFor="msg_media">
                                            <GrImage />
                                            <input id="msg_media" name="msg_media" className="hidden" type="file" accept="image/*, video/*" />
                                        </label>
                                    </Button>


                                    <Button variant="icon" size="icon-sm" tooltip="GIF">
                                        <label htmlFor="msg_gif">
                                            <MdOutlineGifBox  />
                                        </label>
                                        <input id="msg_gif" name="msg_gif" className="hidden" type="file" accept="image/gif" />
                                    </Button>

                                    <Popover open={showPicker} placement='top-start' handler={setShowPicker} offset={{ crossAxis: -100}}>
                                        <PopoverHandler>
                                            <div>
                                                <Button variant="icon" size="icon-sm" tooltip="Emojis" onClick={() => setShowPicker(!showPicker)}>
                                                    <BsEmojiSmile />
                                                </Button>
                                            </div>
                                        </PopoverHandler>
                                        <PopoverContent>
                                            <div className='relative'>
                                                <Picker data={emojiData} onEmojiSelect={(emoji) => {setMessage(msg => msg + emoji.native)}}/>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    {/* send input; ISSUE: Resize observer */}
                                    <TextareaAutosize 
                                    minRows={1}
                                    maxRows={5}
                                    maxLength={1000}
                                    onKeyDown={handleSend}
                                    onChange={(e) => setMessage(e.target.value)} 
                                    placeholder='Start a new message' 
                                    value={message} 
                                    className='flex-3 bg-gray-100  px-4 outline-none resize-none w-full h-fit' 
                                    />

                                    {/* send button */}
                                    <Button variant="icon" size="icon-sm" disabled={message?.trim().length === 0} onClick={handleSend} type="submit" tooltip="Send">
                                        <AiOutlineSend />
                                    </Button>
                                </div>
                            </div>
                    </form>
                </div>
            </MessageWindowWrapper>
        </>

    )
}
