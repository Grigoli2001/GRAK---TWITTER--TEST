import { useState } from 'react'
import { NavLink } from 'react-router-dom';

import TweetMedia from './TweetMedia'
import { ExtAvatar }  from '../User';
import MiniDialog from '../MiniDialog';
import {Button} from '../Button';

// icons
import { GoHeart, GoHeartFill, GoUpload } from "react-icons/go";
import { FaRegComment, FaRetweet, FaRegBookmark, FaBookmark } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { CIQuote } from '../customIcons';

// utils
import { showUsername, showName, timeAgo, quantiyFormat } from '../../utils/utils';


const TweetAction = ({Icon, ActiveIcon, actionCount, title, color, onClick, isActive, }) => {

    if (!ActiveIcon) ActiveIcon = Icon
    // avoid tailwind purging
    const styles = { 
      red: {
        text: `group-hover:text-red-500 ${isActive ? 'text-red-500' : ''}`,
        bg: `group-hover:bg-red-100 `
      },
      blue: {
        text: `group-hover:text-twitter-blue ${isActive ? 'text-twitter-blue' : ''}`,
        bg: 'group-hover:bg-twitter-blue/10'
      }, 
      green: {
        text: `group-hover:text-green-500  ${isActive ? 'text-green-500' : ''}`,
        bg: 'group-hover:bg-green-100'
      }
    }

    let style = styles[color] ?? styles.blue

    
    return (
        <div onClick={onClick} className={`group flex items-center justify-center cursor-pointer`}>

          {/* For some reason Icon padding is removing icon */}
          <Button variant="icon" size="icon-sm"  className={`text-black ${style.bg} ${style.text} transition-colors duration-100`}> 
            {isActive ? <ActiveIcon/> : <Icon/> } 
          </Button>

          {/* use ternary to eval 0 */}
            { 
              actionCount  ? 
             <span className={`text-sm -ml-[6px] ${style.text}`}>{ quantiyFormat(actionCount) }</span>
             : null
            }
            
            <title>{title}</title>
        </div>
    )
}

const Tweet = ({user, post}) => {

  const [postState, setPostState] = useState(post)

  const handleLike = () => {
    console.log('liked')
    setPostState(prev => ({
      ...postState, 
      liked: !postState.liked, 
      likes: postState.liked ? postState.likes - 1 : postState.likes + 1
    }))

    console.log(postState)


  }

  const handleRetweet = () => {
    console.log('retweeted')
    setPostState({
      ...postState,
      retweeted: !postState.retweeted,
      retweets: postState.retweeted ? postState.retweets - 1 : postState.retweets + 1
    })
  }

  const handleReply = () => {
    console.log('replied')
  }

  const handleBookmark = () => {
    console.log('bookmarked')
    setPostState({
      ...postState,
      bookmarked: !postState.bookmarked
    })

  }

  const handleShare = () => {
    console.log('shared')
  }

  return (

    <div className="tweet w-full h-fit p-4 pb-0 grid grid-cols-[70px_auto] border-b border-b-solid border-gray-200">

          <NavLink to={`/${user.username}`} className="mr-4 mt-3 self-start">
            <ExtAvatar src = {user?.avatar} size="sm" />
          </NavLink>

        <div className="grid gap-y-2">

          <div className="flex items-center gap-x-2 text-slate-400">
              
              <a className="flex items-center gap-x-1 text-black hover:underline" href="/">
                <span className="font-bold  ">{showName(user)}</span> { user.verified && <MdVerified className='text-twitter-blue'/>  }
              </a>

              { showUsername(user)} · { timeAgo(postState?.createdAt)} 
              {
              postState?.updatedAt &&
              <span className="text-slate-400 text-sm font-medium italic">edited</span>
              }
          </div>

          <div className="text-justify break-words">
              { postState?.caption }
          </div>

          { 
          postState?.media && 
            <TweetMedia mediaType={postState?.media?.mediaType ?? 'image'} src={postState?.media?.src} alt="" />
          }

          <div className="flex items-center justify-between p-4">
            <TweetAction Icon={FaRegComment} actionCount={postState.replies} title="Reply" color="blue" onClick={handleReply}/>
            
            <MiniDialog>
              <MiniDialog.Wrapper>
                <MiniDialog.Dialog className='absolute -left-2 right-0 w-fit bg-white rounded-xl shadow-all-round font-bold !outline-none z-10'>
                    <ul className='list-none text-sm'>
                        <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap' onClick={handleRetweet}><FaRetweet/> { postState.retweeted ? 'Undo Repost':'Repost' } </li>
                        <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIQuote/> Quote</li>
                    </ul>
                </MiniDialog.Dialog>
                <TweetAction Icon={FaRetweet} actionCount={postState.retweets} title="Retweet" color="green" isActive={postState.retweeted}/>
              </MiniDialog.Wrapper>
            </MiniDialog>
            
            <TweetAction Icon={GoHeart} ActiveIcon={GoHeartFill} actionCount={postState.likes} title="Like" color="red" onClick={handleLike} isActive={postState.liked}/>

            <div className='flex'>
              <TweetAction Icon={FaRegBookmark} ActiveIcon={FaBookmark} title="Save" onClick={handleBookmark} isActive={postState.bookmarked}/>
              <TweetAction Icon={GoUpload} title="Share" onClick={handleShare}/>
            </div>

          </div>
      </div>
    </div>  

)}

export default Tweet


            
    //  if post is uses post allow edit
    //    <div onclick="dth('div')" className="relative ml-auto mr-4 w-10 h-10 flex items-center justify-center rounded-[100%] hover:bg-slate-200 text-lg cursor-pointer">
    //      <div className="absolute bottom-[50%] right-[50%] invisible bg-white flex flex-col w-[100px]">
    //        <span
    //        className="text-sm hover:bg-slate-200 p-2">Edit Post</span>
    //        <span " className="text-sm hover:bg-slate-200 p-2">Delete Post</span>
    //      </div>
    //      <i className="fa-solid fa-ellipsis pointer-events-none"></i>
    //    </div>
    //  {% endif %}