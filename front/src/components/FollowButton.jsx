import { useEffect, useState } from 'react'
import { Button } from './Button'
import { cn } from '../utils/style'

import instance from '../constants/axios'
import { followRequests } from '../constants/requests'


/**
 * Follow button component which takes followed prop
 * Special Case of Button Component with its own internal state
 * TODO: handle follow/unfollow logic
 */
export const FollowButton = ({followed, ...props}) => {

    const { followerid, userid } = props
    const [isFollowed, setIsFollowed] = useState(followed || false)
    const [isHovered, setIsHovered] = useState(false)
    
    const handleFollow = (evt) => {
        evt.stopPropagation()
        evt.preventDefault()
        setIsFollowed(true)
    
        instance
        .post(followRequests.follow, {userId: userid, followerId: followerid})
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }

    const handleUnFollow = (evt) => {
        // opens modal
        evt.stopPropagation()
        evt.preventDefault()
        setIsFollowed(false)

        instance
        .post(followRequests.unfollow, {userId: userid, followerId: followerid})
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }

    // useEffect(() => {
    //     instance
    //         .get(followRequests.following, { params: { userId: userid } })
    //         .then(res => {
    //             const following = res.data.map(follower => follower.following)
    //             setIsFollowed(following.includes(followerid))
    //         })
    //         .catch(err => console.error(err))
    //     }, []);

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
