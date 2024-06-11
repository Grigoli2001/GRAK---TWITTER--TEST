import { useEffect, useState, useContext } from 'react'
import { Button } from './Button'
import { cn } from '../utils/style'

import instance from '../constants/axios'
import { followRequests } from '../constants/requests'
import { createToast } from '../hooks/createToast'
import { SocketContext } from "../context/socketContext"

/**
 * Follow button component which takes followed prop
 * Special Case of Button Component with its own internal state
 */
export const FollowButton = ({followed ,setFollowerCount, followerid, userid, ...props}) => {

    const [isFollowed, setIsFollowed] = useState(followed)
    const [isHovered, setIsHovered] = useState(false)
    const { socket } = useContext(SocketContext);
    
    const handleFollow = (evt) => {
        evt.stopPropagation()
        evt.preventDefault()

        if (followerid === userid) {
            createToast('You cannot follow yourself', 'error', 'error-follow', {limit:1})
            return
        }

        instance
        .post(followRequests.follow, {
            otherUserId: followerid
        })
        .then(res => {  
            setIsFollowed(true)
            socket?.emit("notification:new", {
                userId: followerid,
                triggeredByUserId: userid,
                notificationType: "follow",
            });
            if (setFollowerCount) setFollowerCount((prev) => prev + 1)
        })
        .catch(err => createToast('We couldnt process this request at the moment','error', 'error-follow', {limit:1}))
    }

    const handleUnFollow = (evt) => {
        // opens modal
        evt.stopPropagation()
        evt.preventDefault()
        

        if (followerid === userid) {
            createToast('You cannot follow yourself', 'error', 'error-un-follow', {limit:1})
            return
        }

        instance
        .post(followRequests.unfollow, {otherUserId: followerid})
        .then(res =>{ 
            setIsFollowed(false); 
            if (setFollowerCount) setFollowerCount((prev) => prev <= 0 ? 0 : prev - 1)
        })
        .catch(err => console.error(err))
    }



    return (
         
            !isFollowed ? 

            <Button onClick={handleFollow} variant='dark' {...props}>
                Follow
            </Button>
            
            :

            <Button 
            onClick={handleUnFollow} 
            onMouseOver={() => setIsHovered(true)} 
            onMouseOut={()=>setIsHovered(false)} 
            variant='outlined' 
            {...props}
            className={cn(props.className, {
                'bg-white text-black': !isHovered,
                'hover:bg-red-200 text-red-500 border-red-400': isHovered
            })}>
                {isHovered ? 'Unfollow' : 'Following'}
            </Button>


    )
}
