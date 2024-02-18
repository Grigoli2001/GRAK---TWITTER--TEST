import { createContext,  useEffect, useRef, useState, useContext } from 'react'
import { UserContext } from "../../context/UserContext";

//  components
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { PollCreate } from './Poll';
import { Button } from '../Button';
import TextCounter from './TextCounter';
import { ExtAvatar }  from '../User';
import MiniDialog from '../MiniDialog';

// axios
import instance from "../../constants/axios";
import { requests } from "../../constants/requests";

// icons
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { CIPoll, CIAccountYouFollow } from "../customIcons";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarClock } from "react-icons/lu";
import { FaGlobeAfrica, FaGlobeAmericas } from "react-icons/fa";
import { FiAtSign } from "react-icons/fi";

import TweetMedia from './TweetMedia';
import { SocketContext } from '../../context/socketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { createToast } from '../../hooks/createToast';

/**
 * Form for creating a tweet
 * TODO use form tag or send with axios?
 */
// done

export const TweetContext = createContext(null);

const TweetCreate = ({type = 'Post', reference_id = null}) => {
  const user = useContext(UserContext);
  const tweetMaxLength = 300;
  const defaultTweetText = type === 'Post' ? 'What is happening?!' : 'Post your reply';
  const { socket } = useContext(SocketContext)
  const location = useLocation();
  const navigate = useNavigate();

  // media refs
  const mediaRef = useRef();
  const gifRef = useRef();

  // states for each button
  const [buttonStates, setButtonStates] = useState({
    media: false,
    gif:  false,
    poll: false,
    schedule: true,
    location: true,
  });

  const [textAreaPlaceholder, setTextAreaPlaceholder] = useState(defaultTweetText);
  const [isInteracted, setIsInteracted] = useState(false); // show can reply dialog
  const [canReply, setCanReply] = useState('everyone'); // can reply value
  
  const updateCanReply = (value) => {
    setCanReply(value);
    setTweetForm({
      ...tweetForm,
      tweetCanReply: value
    })
  }

  // polls
  const [openPoll, setOpenPoll] = useState(false); // open poll options
  const createPoll = () => {

    setTextAreaPlaceholder('Ask a question');

    setOpenPoll(true);

    setButtonStates({
      ...buttonStates,
      poll: true,
      media: true,
      gif: true
    })
  }

  const removePoll = () => {

    setTextAreaPlaceholder(defaultTweetText)

    setOpenPoll(false);

    setButtonStates({
      ...buttonStates,
      poll: false,
      media: false,
      gif: false
    })

    setTweetForm({
      ...tweetForm,
      tweetPoll: null
    })
  }

    // form tweet text
    const [tweetForm, setTweetForm] = useState({
      tweetType: type === 'Post' ? 'tweet' : (type === 'Reply' ? 'reply' : 'retweet'),
      tweetText: '',
      tweetMedia: null,
      tweetPoll: null,
      tweetSchedule: null,
      tweetLocation: null,
      reference_id: reference_id ? reference_id : null,
      tweetCanReply: canReply
    });

    const removeMedia = () => {
      if (mediaRef.current) mediaRef.current.value = null;
      if (gifRef.current) gifRef.current.value = null;

      setTweetForm({
        ...tweetForm,
        tweetMedia: null
      })
    }

    const resetTweetForm = () => {
      removeMedia()
      removePoll()
      
      setTextAreaPlaceholder(defaultTweetText)
      setButtonStates(
        {media: false,
          gif:  false,
          poll: false,
          schedule: true,
          location: true,}
        
      )
      setTweetForm({
        ...tweetForm,
        tweetText: '',
        tweetMedia: null,
        tweetPoll: null,
        tweetSchedule: null,
        tweetLocation: null,
        reference_id: null,
        tweetCanReply: canReply
      });
      
      
    }

  // update tweetText
  const handleUpdateTweetText = (e) => {
    if (e.target.value.length > tweetMaxLength) {
      e.target.value = e.target.value.slice(0, tweetMaxLength);
      return
    } 
    setTweetForm(
      {
        ...tweetForm,
        [e.target.name]: e.target.value
      }
    );
  }

  const handleMediaChange = async(evt) => {
    if (evt.target.files && evt.target.files[0]) {
      const file = evt.target.files[0];
      const mime = file.type;
      console.log(mime)
      // simple mimetype check because file-type is giving issues even with browserify
      if (!mime.startsWith('image') && !mime.startsWith('video')) {
        createToast('Only Images and videos allowed', 'warn', {limit: 1});
        return
      }
      removePoll();

      setTweetForm({
        ...tweetForm,
        tweetMedia: evt.target.files[0]
      })
    }
  }

  const [canPost, setCanPost] = useState(false); // post button state
  
  useEffect(() => {
  // if the form has text and and choices for poll
      // if the form has media only 
      // if the form has text only

    // more readable approach
      const { tweetText, tweetPoll, tweetMedia } = tweetForm;
      const isTextNotEmpty = tweetText?.trim().length > 0;
      const isPollValid = tweetPoll?.valid;
      const isMediaPresent = !!tweetMedia;
      const enablePostButton = (isTextNotEmpty && isPollValid) || isMediaPresent || (isTextNotEmpty && !tweetPoll);
      console.log((isTextNotEmpty && isPollValid),isMediaPresent,(isTextNotEmpty && !tweetPoll))
  
      setCanPost(enablePostButton);
  }, [tweetForm]);
  

  const handleCreateTweet = () => {
    if (!canPost) return
    let formData = new FormData();
    const { tweetMedia , ...tweetData } = tweetForm;
    formData.append('data', JSON.stringify(tweetData));
    formData.append('tweetMedia', tweetForm.tweetMedia);
    formData.append('tweetText', tweetForm.tweetText);
    formData.append('tweetType', tweetForm.tweetType);
    
    if (tweetForm.tweetSchedule !== null) {
      formData.append('tweetSchedule', tweetForm.tweetSchedule);
    }

    instance
      .post(requests.createTweets, formData, { headers: {
        'Content-Type': 'multipart/form-data'
      }}
      )
      .then((response) => {
        // update redux 
        formData = new FormData();
        resetTweetForm()
        createToast(`Nice ${type}🥳`, 'success', 'success-create-post', {limit: 1})
        socket.emit('feed:notify-create-post', { user })
        if ((location.pathname) === '/compose/tweet'){
          if (location.state?.background){
            return navigate(-1)
          }else{
           return  navigate(`/${user.username}`)
          }
        }
      
      })
      .catch((error) => {
        createToast('An error occured', 'error');
      });
  }

  return (
    <TweetContext.Provider value={{ tweetForm, setTweetForm }}>
      <section
      className="w-full relative h-fit p-4 pb-0 grid grid-cols-[75px_auto] border-b border-b-solid border-gray-200"
      onClick={() => setIsInteracted(true)}
      >

        {/* Spinner  for loading rquests TODO: use react loading?  */}
        <div className="post-spinner hidden absolute bg-gray-200 opacity-50 z-10 w-full h-full items-center justify-center">
          {/* <span className="loader z-20 opacity-100"></span> */}
        </div>

    <div className="mr-4">
    <ExtAvatar src = {user?.profile_pic} size="sm" />
    </div>

    <div className="flex flex-col">
      <TextareaAutosize
      maxLength={tweetMaxLength}
      minRows={2}
      placeholder={textAreaPlaceholder}
      name="tweetText"
      value={tweetForm.tweetText}
      className="resize-none overflow-hidden w-full pt-0 pb-2 pr-3 ml-4 border-none outline-none break-words placeholder:text-slate-600 placeholder:text-xl"
      onChange={handleUpdateTweetText}
      />

    <div className="post-media ml-4">
        {
          openPoll ? 
            <PollCreate removePoll={removePoll}/>
            : tweetForm.tweetMedia ?
             <TweetMedia mediaType={'image'} src={URL.createObjectURL(tweetForm.tweetMedia)} as_form={true} removeMedia={removeMedia}/>
            : null
        }
    </div>

    { 
      isInteracted && type !== 'Reply' &&

        <MiniDialog>
          <MiniDialog.Wrapper className="flex items-center font-semibold text-twitter-blue ml-2 px-2 hover:bg-twitter-blue/10 cursor-pointer w-fit py-1 rounded-full relative">  
          
          {

            canReply === 'everyone' ?
            <>
              <FaGlobeAfrica className='mr-2'/>
              <span className="text-sm"> Everyone can reply</span>
            </>

            : canReply === 'follow' ?

            <>
              <CIAccountYouFollow className='mr-2'/>
              <span className="text-sm">Accounts you follow can reply</span>
            </>
            : canReply === 'mention' ?
            <>
            <FiAtSign className='mr-2'/>
            <span className="text-sm"> Only accounts you mention can reply</span>

            </>
            : null
          
          }
            <MiniDialog.Dialog className="absolute top-[100%] z-10 bg-white rounded-lg text-sm text-black min-w-[250px] shadow-all-round overflow-hidden">

                <div className='p-2'>
                  <h4 className='font-bold'>Who can reply?</h4>
                  <p className="text-xs text-slate-400">Choose who can reply to this post. Anyone mentioned can always reply.</p>
                </div>
                <ul className={`list-none`}>
                  <li className="flex items-center hover:bg-slate-200 p-2 cursor-pointer font-semibold" onClick={() => updateCanReply('everyone')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                      <FaGlobeAmericas/>
                    </div>
                    Everyone
                  </li>

                  <li className="flex items-center hover:bg-slate-200  p-2 cursor-pointer" onClick={() => updateCanReply('follow')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                        <CIAccountYouFollow />
                    </div>
                    Accounts you follow
                  </li>

                  <li className="flex items-center hover:bg-slate-200 p-2 cursor-pointer" onClick={() => updateCanReply('mention')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                      <FiAtSign/>
                    </div>
                    Only accounts you mention
                  </li>

                </ul>
            </MiniDialog.Dialog>
          </MiniDialog.Wrapper>
        </MiniDialog>
    }
    
    <div className={`flex mt-4 w-full gap-x-1 py-3 items-center justify-between ${isInteracted && 'border-t border-solid border-slate-200'}`}>
      <div className="flex items-center gap-x-4 text-twitter-blue">

        <Button variant="icon" size="icon-sm" disabled={buttonStates.media} className="pointer-events-auto">
          <label htmlFor="post_media">
            <GrImage title="Media" />
            <input id="post_media" name="post_media" onChange={handleMediaChange} ref={mediaRef} className="hidden" type="file" accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg, video/*"/>
          </label>
        </Button>


          <Button variant="icon" size="icon-sm" disabled={buttonStates.gif}>
            <label htmlFor="post_gif">
              <MdOutlineGifBox title="GIF" />
            </label>
            <input id="post_gif" name="post_gif" onChange={handleMediaChange} ref={gifRef} className="hidden" type="file" accept="image/gif"/>
          </Button>

        <Button onClick={createPoll}  variant="icon" size="icon-sm" disabled={buttonStates.poll}>
          <CIPoll />
        </Button>

          <Button variant="icon" size="icon-sm" disabled={buttonStates.schedule} >
            <LuCalendarClock />
          </Button>

          <Button variant="icon" size="icon-sm"disabled={buttonStates.location}>
            <IoLocationOutline />
          </Button>

      </div>

      <div className="flex gap-x-4 items-center">

      {/* TODO check if editing or creating */}

          {/* <Button onClick={() => console.log("cancel Edit")} variant="filled" color="gray" className='text-black rounded-full'>Cancel</Button>
          <Button onClick={handleEditTweet} variant="filled" className='rounded-full bg-twitter-blue'>Edit</Button> */}
          
          <TextCounter textCount={tweetForm.tweetText?.length} maxLength={tweetMaxLength} ></TextCounter>
          <Button onClick={handleCreateTweet} disabled={!canPost}>{type}</Button>
          
      </div>
    </div>
  </div>
</section>
</TweetContext.Provider>

  )
}

export default TweetCreate


