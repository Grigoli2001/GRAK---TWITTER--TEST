import  {useEffect, useState, useContext, useRef, useCallback, useLayoutEffect} from 'react'
import {  Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../Button'
import { AiOutlineInfoCircle } from "react-icons/ai";
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlineSend } from "react-icons/ai";
// import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import TextareaAutosize from 'react-textarea-autosize';
import Message, { Typing } from './Message';
import { NavLink, useParams } from 'react-router-dom';

import '../../styles/messages.css'
import { ExtAvatar } from '../User';
import { evalRoom, getJoinDate, showUsername } from '../../utils/utils';
import { SocketContext } from '../../context/socketContext';
import ReactLoading from 'react-loading'
import instance from '../../constants/axios'
import  Picker  from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import { Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react';
import { DefaultModal as Modal } from '../NavModal'
import { createToast } from '../../hooks/createToast';
import useUserContext from '../../hooks/useUserContext';
import { useDispatch } from "react-redux";
import { addNotif } from '../../features/tweets/navNotifSlice';
// import useInstance from '../../hooks/useInstance';
// import TweetMedia from '../tweet/TweetMedia';
import { ValidUserContext } from '../RequireValidUser';


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
    const { user } = useUserContext()
    const  { activeUser: chatTo, isLoading } = useContext(ValidUserContext)
    const { username } = useParams()
    const navigate = useNavigate()   
    
    // const [ chatTo, setChatTo] = useState(null)   
    const [ room , setRoom ] = useState(null)
    const [message, setMessage] = useState('')

    const messageWindowRef = useRef(null)
    const [page, setPage] = useState(0)

    const observer = useRef()
    const [otherIsTyping, setOtherIsTyping] = useState(false)
    const typingTimeoutRef = useRef(null)

    const [messages, setMessages] = useState([])
    const [windowLoaded, setWindowLoaded] = useState(false)
    const [messageLoading, setMessageLoading] = useState(true)
    const [ hasMore, setHasMore] = useState(false)
    const [media, setMedia] = useState(null)

    // picker states
    const [showPicker, setShowPicker] = useState(false)
    const [newMessage, setNewMessage] = useState(false)

    // get last message sent and received
    const [ lastSent, setLastSent ] = useState(null)
    const [ lastReceived, setLastReceived ] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [deleteText, setDeleteText] = useState('you only' )
    const [messageToDelete, setMessageToDelete] = useState(null)
    const reduxDispatch = useDispatch()

    // check if a user is found and join the room when component mounts
    useEffect(() => {

        if (!isLoading){
            // const returnToMessages = () => { navigate('/messages') }
            // console.log('chatToData', chatToData)
            // console.log(chatToData)

            // if (!chatToData?.user){
            //     console.log('no chat to found', chatToData)
            //     returnToMessages()
            //     return
            // } 
            // setChatTo(chatToData.user)
            setMessages([])
            setPage(0)
            setWindowLoaded(true)
            const room = evalRoom(user, chatTo)
            setRoom(room)
            socket.emit('message:join_room', { room } )
        
    }
        
    }, [username, isLoading])

    const mediaRef = useRef(null)
    const gifRef = useRef(null)
    const handleMediaChange = async(evt) => {
        if (evt.target.files && evt.target.files[0]) {
          const file = evt.target.files[0];
          const mime = file.type;
          // simple mimetype check because file-type is giving issues even with browserify
          if (!mime.startsWith('image')) {
            createToast('Only Images can be sent with messages', 'warn', {limit: 1});
            return
          }
          setMedia(URL.createObjectURL(file))
      }
      }
   
    useEffect(() => {
        // if there's no room, don't fetch messages
        if (!room || isLoading) return
        // set loading and error states for fetching messages
        setMessageLoading(true)
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
            createToast("Sorry! An error occured", 'error', 'error-get-messages', {limit: 1})
            }
        )
        .finally(() => setMessageLoading(false))

  }, [room, page])

    useEffect(() => {
    if (messages?.length){
        setLastSent(messages.find(msg => msg.sender_id === user.id && !msg.is_deleted_for_everyone))
        setLastReceived(messages.find(msg => msg.sender_id !== user.id && !msg.is_deleted_for_everyone))
    }
    }, [messages])

    const scrollToBottom = useCallback(() => { 
        messageWindowRef.current?.scrollTo({ top: messageWindowRef?.current.scrollHeight, behavior: 'instant' })
    }, [messageWindowRef.current])

    useEffect(() => {
        scrollToBottom()
    }, [newMessage])

    const earliestMessage = useCallback(firstMessage => {

        if (messageLoading) return
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
    }, [isLoading, hasMore])


    // SOCKETS
    // listen for new messages
    useEffect(() => {

        function handleReceived(msg) { 
            console.log('received message', msg)
            setMessages(prevMessages => [ msg, ...prevMessages ])
            setNewMessage(!newMessage)
        }

        function handleDeleted(msg_id) {
            setMessages(prevMessages => prevMessages.filter(msg => msg.message_id !== msg_id))
        }

        socket?.on('message:received_message', handleReceived)
        socket?.on('message:deleted_message', handleDeleted)

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
                const msgObj = {message, sender_id: user.id, receiver_id: chatTo.id, room: room, username: user.username, date: new Date(), media}
                console.log('sending message', msgObj)
                socket.emit('message:send_message', msgObj)
                // setMessages([ ...messages, msgObj,])
                setMessage('')
                setMedia(null)
                setNewMessage(!newMessage)
            }
        }else{
            socket.emit('message:typing', {room, user: user.id})
        }
    }

    const handleModalOpen = (msg_id, everyone=false) => {
        console.log(msg_id)
        setMessageToDelete(msg_id, everyone)
        if (everyone){
            setDeleteText('everyone')
        }else{
            setDeleteText('you only')
        }
        setModalOpen(true)
    }

    const handleDeleteMessageReq = (msg_id) => {
        instance.delete('/messages/delete-message', {
            data:{
                msg_id,
            } 
        }).then(res => {
            if (res.status === 204) {
                    createToast("Message not found!", 'error', 'error-del-message', {limit: 1})
                    return
            }
            setMessages(prevMessages => prevMessages.filter(msg => msg.message_id !== msg_id))
            createToast(res.data.message, 'success', 'success-del-message', {limit: 1})
        })
        .catch(err => {
            createToast("Failed to delete message!", 'error', 'error-del-message', {limit: 1})
        }).finally(() => setModalOpen(false))
    }

    const handleDeleteMessageSocket = (msg_id) => {
        socket.emit('message:delete_message', {room, msg_id})
    }

    useEffect(() => {

        const handleDeleteError = (error) => {
            createToast("Failed to delete message!", 'error', 'error-del-message', {limit: 1})
            setModalOpen(false)

        }

        const receiveDelete = (data) => {
            const { msg_id } = data
            // update the message in the messages state
            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.message_id === msg_id){
                    
                    msg.message = 'This message was deleted'
                    msg.is_deleted_for_everyone = true  
                }
                return msg
            })
            )
        }

        const handleDeleteSuccess = (data) => {
            createToast("Message deleted!", 'success', 'success-del-message', {limit: 1})
            setModalOpen(false)
        }

        socket.on('message:error_deleted_message', handleDeleteError)
        socket.on('message:deleted_message', receiveDelete)
        socket.on('message:success_deleted_message', handleDeleteSuccess)
 
        return () => {
            socket.off('message:deleted_message')
            socket.off('message:error_delete_message')
        }
    }, [socket])


    return (

        isLoading ? 
        <MessageWindowWrapper>
            <div className='flex items-center justify-center w-full h-full'>
            <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
            </div>
        </MessageWindowWrapper>

        :
        <>

            <Modal open={modalOpen} handleBackClick={() => setModalOpen(false)}>
                <div className='p-4 flex flex-col bg-white rounded-xl gap-y-2'>
                    <h1 className='text-xl font-bold'>Delete message for {deleteText}</h1>
                    {deleteText==='everyone' && <p className='text-slate-500'>If @{chatTo.username} has already read this message, it will only be deleted for you.</p>}
                    <p className='text-gray-600'>Are you sure you want to delete this message?</p>
                    <Button onClick={deleteText === "everyone" ? 
                            () => handleDeleteMessageSocket(messageToDelete): 
                            () => handleDeleteMessageReq(messageToDelete)
                            } variant='outline' className='w-fit bg-red-500 self-center'>Delete</Button>
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
                                isLastMessage={msg.message_id === lastSent?.message_id || msg.message_id === lastReceived?.message_id}
                                handleModalOpen={handleModalOpen}
                                />)
                            }
            
                        )}
                        
                        { 
                            messageLoading && 
                                <div className='flex items-center justify-center w-full p-6'>
                                    <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
                                </div>
                        }

                        <div className="flex flex-col items-center justify-center pt-20 pb-8 mx-auto text-sm border-b border-b-gray-200 w-full">
                            <ExtAvatar size="lg" src={chatTo?.profile_pic} />
                            <p className='font-bold'>{chatTo?.name}</p>
                            <p>{showUsername(chatTo)}</p>
                            <p>Joined {getJoinDate(chatTo.created_at)}</p>
                        </div>


                    </div>


                    <form className='flex flex-col sticky bottom-0 bg-white h-fit px-4 py-1 border-t border-t-gray-100' onSubmit={handleSend}>
                            <div className='bg-gray-100 rounded-2xl w-full  outline-none px-4 py-1'>
                                <div className='flex flex-row items-center flex-nowrap'>

                                <Button variant="icon" size="icon-sm"  className="pointer-events-auto">
                                    <label htmlFor="message_media">
                                        <GrImage title="Media" />
                                        <input id="message_media" name="post_media" onChange={handleMediaChange} ref={mediaRef} className="hidden" type="file" accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg"/>
                                    </label>
                                    </Button>


                                    <Button variant="icon" size="icon-sm" >
                                        <label htmlFor="message_gif">
                                            <MdOutlineGifBox title="GIF" />
                                        </label>
                                        <input id="message_gif" name="message_gif" onChange={handleMediaChange} ref={gifRef} className="hidden" type="file" accept="image/gif"/>
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
                                    <div className='ml-auto w-full'>
                                        { media && <img src={media} alt="media" />}
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
                                    </div>

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
