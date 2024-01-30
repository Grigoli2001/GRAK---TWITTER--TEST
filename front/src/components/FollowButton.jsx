import { useState } from 'react'
import { Button } from './Button'

/**
 * Follow button component which takes followed prop
 * Special Case of Button Component with its own internal state
 * TODO: handle follow/unfollow logic
 */
export const FollowButton = ({followed}) => {

    const [isFollowed, setIsFollowed] = useState(followed)
    const [isHovered, setIsHovered] = useState(false)
    
    const handleFollow = (evt) => {
        evt.stopPropagation()
        evt.preventDefault()
        setIsFollowed(!isFollowed)
    }

    return (
         
            !isFollowed ? 

            <Button onClick={handleFollow} size='sm' variant='dark'>
                Follow
            </Button>
            
            :

            <Button 
            onClick={handleFollow} 
            onMouseOver={() => setIsHovered(true)} 
            onMouseOut={()=>setIsHovered(false)} 
            variant='outlined' 
            size='sm' ripple={true} 
            className={!isHovered ? 'bg-white text-black' : 'hover:bg-red-200 text-red-500 border-red-400'}>
                {isHovered ? 'Unfollow' : 'Following'}
            </Button>


    )
}
