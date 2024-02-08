import { createContext,  useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/style';

//  components
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { PollCreate } from './Poll';
import { Button } from '../Button';
import TextCounter from './TextCounter';
import { ExtAvatar }  from '../User';
import TweetMedia from './TweetMedia';
import { Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react';

// icons
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { CIPoll, CIAccountYouFollow } from "../customIcons";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarClock } from "react-icons/lu";
import { FaGlobeAfrica, FaGlobeAmericas } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { FiAtSign } from "react-icons/fi";

// test
import { users } from '../../constants/feedTest';

/**
 * Form for creating a tweet
 * 
 */

export const TweetContext = createContext(null);

// onModal bool
const TweetCreate = ({onModal}) => {
  // max length of tweet
  const tweetMaxLength = 300;
  const defaultTweetText = 'What is happening?!';

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
      tweetText: '',
      tweetMedia: null,
      tweetPoll: null,
      tweetSchedule: null,
      tweetLocation: null,
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
    // console.log('rerender')

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

  const handleMediaChange = (evt) => {
    if (evt.target.files && evt.target.files[0]) {
      removePoll();

      setTweetForm({
        ...tweetForm,
        tweetMedia: URL.createObjectURL(evt.target.files[0])
      })
    }
  }

  const [canPost, setCanPost] = useState(false); // post button state
  

  // TODO: works for now but needs to be refactored
  useEffect(() => {
    const evalCanPost = () => {
      // if the form has text and and choices for poll
      // if the form has media only 
      // if the form has text only
      if ((tweetForm.tweetText.length > 0 && tweetForm.tweetPoll?.valid) || tweetForm.tweetMedia || (tweetForm.tweetText.length > 0 && !tweetForm.tweetPoll)) {
        return true
      }
      return false
  }

    setCanPost(evalCanPost());
  }, [tweetForm])

  const handleCreateTweet = () => {
    if (!canPost) {
      // console.log(tweetForm)
      return
    }
    // axios.post('/api/tweets/create', {tweetText})
  }

  // const handleEditTweet = () => {
    // axios.patch('/api/tweets/edit', {tweetText})
  // }



  // testing
  const user = users[0];

  return (
    <TweetContext.Provider value={{tweetForm, setTweetForm}}>
      <section
      className={cn("w-full relative h-fit p-4 pb-0 grid grid-cols-[50px_auto]", {
        'border-b border-b-solid border-slate-200': !onModal
      })}

      onClick={() => setIsInteracted(true)}
      >

        {/* Spinner  for loading rquests TODO: use react loading?  */}
       

    <div className="mr-4">
      <ExtAvatar src = {user?.avatar} size="sm" />
    </div>

    <div className="flex flex-col">
      <TextareaAutosize
      maxLength={tweetMaxLength}
      minRows={2}
      maxRows={5}
      placeholder={textAreaPlaceholder}
      name="tweetText"
      className="resize-none overflow-hidden w-full pt-0 pb-2 pr-3 ml-4 border-none outline-none break-words placeholder:text-slate-600 placeholder:text-xl"
      onChange={handleUpdateTweetText}
      />

    <div className="post-media ml-4">
        {
          openPoll ? 
            <PollCreate removePoll={removePoll}/>
            : tweetForm.tweetMedia ?
             <TweetMedia mediaType={'image'} src={tweetForm.tweetMedia} as_form={true} removeMedia={removeMedia}/>
            : null
        }
    </div>

    { 
      isInteracted &&

        <Popover placement='bottom-start' className='relative z-10' >
          <PopoverHandler className="flex items-center font-semibold text-twitter-blue ml-2 px-2 hover:bg-twitter-blue/10 cursor-pointer w-fit py-1 rounded-full relative">  
          <div>
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
            <PopoverContent className="!p-0 z-[1000] !shadow-all-round bg-white rounded-lg text-sm text-black overflow-hidden min-w-[350px]">

              
                <div className='p-3'>
                  <h4 className='font-bold'>Who can reply?</h4>
                  <p className="text-sm text-slate-400 text-wrap">Choose who can reply to this post.<br/> Anyone mentioned can always reply.</p>
                </div>
                <ul className={`list-none`}>
                  <li className={cn('flex items-center hover:bg-slate-200 p-3 cursor-pointer', {
                    'font-semibold': canReply === 'everyone'})} onClick={() => updateCanReply('everyone')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                      <FaGlobeAmericas/>
                    </div>
                    Everyone
                    {canReply === 'everyone' && <IoCheckmark className='text-twitter-blue ml-auto text-lg'/>}
                  </li>

                  <li className={cn('flex items-center hover:bg-slate-200 p-3 cursor-pointer', {
                    'font-semibold': canReply === 'follow'})} onClick={() => updateCanReply('follow')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                        <CIAccountYouFollow />
                    </div>
                    Accounts you follow
                    {canReply === 'follow' && <IoCheckmark className='text-twitter-blue ml-auto text-lg'/>}
                  </li>

                  <li className={cn('flex items-center hover:bg-slate-200 p-3 cursor-pointer', {
                    'font-semibold': canReply === 'mention'})} onClick={() => updateCanReply('mention')}>
                    <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                      <FiAtSign/>
                    </div>
                    Only accounts you mention
                    {canReply === 'mention' && <IoCheckmark className='text-twitter-blue ml-auto text-lg'/>}

                  </li>

                </ul>
            </PopoverContent>
            </div>
          </PopoverHandler>
        </Popover>
    }
  </div>

  <div className={cn('flex mt-4 w-full gap-x-1 py-3 items-center justify-between col-start-2', {
      'border-t border-solid border-slate-200': isInteracted || onModal,
      'col-start-1 col-span-full':onModal
      })}>
      <div className="flex items-center gap-x-4 text-twitter-blue">

        <Button variant="icon" size="icon-sm" tooltip="Media" disabled={buttonStates.media} className="pointer-events-auto">
          <label htmlFor="post_media">
            <GrImage title="Media" />
            <input id="post_media" name="post_media" onChange={handleMediaChange} ref={mediaRef} className="hidden" type="file" accept="image/*, video/*"/>
          </label>
        </Button>


          <Button variant="icon" size="icon-sm" tooltip="GIF" disabled={buttonStates.gif}>
            <label htmlFor="post_gif">
              <MdOutlineGifBox title="GIF" />
            </label>
            <input id="post_gif" name="post_gif" onChange={handleMediaChange} ref={gifRef} className="hidden" type="file" accept="image/gif"/>
          </Button>

        <Button onClick={createPoll} tooltip="Poll"  variant="icon" size="icon-sm" disabled={buttonStates.poll}>
          <CIPoll />
        </Button>

          <Button variant="icon" size="icon-sm" tooltip="Schedule" disabled={true} >
            <LuCalendarClock />
          </Button>

          <Button variant="icon" size="icon-sm" tooltip="Location" disabled={buttonStates.location}>
            <IoLocationOutline />
          </Button>

      </div>

      <div className="flex gap-x-4 items-center">
        
          <TextCounter textCount={tweetForm.tweetText?.length} maxLength={tweetMaxLength} />
          <Button onClick={handleCreateTweet} disabled={!canPost}>Post</Button>
          
      </div>
    </div>
</section>
</TweetContext.Provider>

  )
}

export default TweetCreate


