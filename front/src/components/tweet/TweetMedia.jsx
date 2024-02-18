import ReactPlayer from 'react-player';
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/style';

import { Button } from '../Button';

// icons 
import { FaXmark } from "react-icons/fa6";


// ENUM MEDIA TYPES
// IMAGE
// GIF
// VIDEO

export const TweetMiniMedia = ({post, user}) => {

    const media = post.media;
    // navigate to modal
    return (
            <NavLink to={`/${user.username}/status/${post.id}/${post.media.mediaType}`} className="relative  flex items-center justify-center">
                {
                    (media.mediaType === 'image' || media.mediaType === 'gif')  && 
                    <img className="h-48 w-full  bg-white object-cover" src={media.src} alt={media.alt} />
                }

                { 
                    media.mediaType === 'video' && 

                        <ReactPlayer url={media.src} light={media.thumbnail ?? true} className="!h-48"/>
                }
    
            </NavLink>
    )
}


const TweetMedia = ({mediaType, src, alt, as_form, removeMedia}) => {
    console.log(mediaType === 'image' || mediaType === 'gif' )
    console.log('src', src)
  return (
       

        <div className={cn('media rounded-2xl relative px-4 w-full h-[250px] flex items-center justify-center border border-solid border-slate-500 bg-black',{
            "bg-white": as_form
             })}>
                {
                    as_form  && 
                        <Button 
                        onClick={() => removeMedia()}
                        variant="icon"
                        size="icon-sm"
                        tooltip="Close Media"
                        className="absolute top-4 right-4 text-white !bg-black/50">
                            <FaXmark/>
                        </Button>

                }
                {
                    (mediaType === 'image' || mediaType === 'gif')  && 
                    <img className="h-full w-full bg-black object-cover" src={src} alt={alt} />
                }

                { 
                    mediaType === 'video' && 

                        <ReactPlayer url={src} controls={true} width="250" height="250" className="h-full w-full"/>
                        
                }

        </div>
  )
}

export default TweetMedia

