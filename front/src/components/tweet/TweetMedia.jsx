import ReactPlayer from 'react-player';

import { Button } from '../Button';

// icons 
import { FaXmark } from "react-icons/fa6";


// ENUM MEDIA TYPES
// IMAGE
// GIF
// VIDEO

const TweetMedia = ({mediaType, src, alt, as_form, removeMedia}) => {

  return (
       

        <div className={`media rounded-2xl relative px-4 w-full h-[250px] flex items-center justify-center border border-solid border-slate-500 ${as_form ? "bg-white" :  "bg-black" }`}>
                {
                    as_form  && 
                        <Button 
                        onClick={() => removeMedia()}
                        variant="icon"
                        size="icon-sm"
                        className="absolute top-4 right-4 text-white !bg-black/50">
                            <FaXmark/>
                        </Button>

                }
                {
                    (mediaType === 'image' || mediaType === 'gif')  && 
                    <img className="h-full max-w-5/6 bg-white object-cover" src={src} alt={alt} />
                }

                { 
                    mediaType === 'video' && 

                        <ReactPlayer url={src} controls={true} width="250" height="250" className="h-full w-full"/>
                        
                }

        </div>
  )
}

export default TweetMedia

