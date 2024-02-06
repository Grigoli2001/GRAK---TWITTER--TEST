import { useState } from 'react'
import { Button } from './Button'
import { cn } from '../utils/style'

/**
 * Follow button component which takes followed prop
 * Special Case of Button Component with its own internal state
 * TODO: handle follow/unfollow logic
 */
export const FollowButton = ({followed, ...props}) => {

    const [isFollowed, setIsFollowed] = useState(followed)
    const [isHovered, setIsHovered] = useState(false)
    
    const handleFollow = (evt) => {
        evt.stopPropagation()
        evt.preventDefault()
        setIsFollowed(true)
        
    }

    const handleUnFollow = (evt) => {
        // opens modal
        evt.stopPropagation()
        evt.preventDefault()
        setIsFollowed(false)
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
