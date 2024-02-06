import { useState, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/testUserContext';
import TweetMedia, { TweetMiniMedia } from './TweetMedia'
import { ExtAvatar, UserCard  }  from '../User';
import {Button} from '../Button';
import { Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react';


// icons
import { GoHeart, GoHeartFill, GoUpload } from "react-icons/go";
import { FaRegComment, FaRetweet, FaRegBookmark, FaBookmark, FaEllipsis } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { CIQuote } from '../customIcons';
import { RiDeleteBinLine } from "react-icons/ri";

// utils
import { showUsername, timeAgo, quantiyFormat } from '../../utils/utils';
import { cn } from '../../utils/style';


const TweetAction = ({Icon, ActiveIcon, actionCount, title, color, onClick, isActive,tooltip }) => {

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
          <Button variant="icon" size="icon-sm" tooltip={tooltip}  className={`text-black ${style.bg} ${style.text} transition-colors duration-100`}> 
          {/* style has to applied directly on the button to ovverrife variant defaults */}
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

const BaseTweet = ({tweetUser, post, isLast}) => {

  const [postState, setPostState] = useState(post)
  const { user } = useContext(UserContext)
 

  const handleLike = (e) => {
    e.stopPropagation()
    console.log('liked')
    setPostState(prev => ({
      ...postState, 
      liked: !postState.liked, 
      likes: postState.liked ? postState.likes - 1 : postState.likes + 1
    }))

    console.log(postState)
  }

  const handleRetweet = (e) => {
    // e.stopPropagation() do not stop propagation let it go to parent div for dialog who will then handle the stop propagation to the tweet

    console.log('retweeted')
    setPostState({
      ...postState,
      retweeted: !postState.retweeted,
      retweets: postState.retweeted ? postState.retweets - 1 : postState.retweets + 1
    })
  }

  const handleReply = (e) => {
    e.stopPropagation()
    console.log('replied')
  }

  const handleBookmark = (e) => {
    console.log('bookmarked')
    e.stopPropagation()
    setPostState({
      ...postState,
      bookmarked: !postState.bookmarked
    })
  }

  const handleShare = (e) => {
    e.stopPropagation()
    console.log('shared')
  }

  const navigate = useNavigate()
  
  return (

    // tweets for feed page, post is diff for single post view
    <div onClick={() => navigate(`/${tweetUser.username}/status/${post.id}`)} 
      className={cn('tweet w-full h-fit p-4 pb-0 grid grid-cols-[auto_1fr] hover:bg-gray-100 cursor-pointer', {
      'border-b border-b-solid border-gray-200': !isLast})}>

          <NavLink onClick={(e) => e.stopPropagation()} to={`/${tweetUser.username}`} className="mr-4 mt-3 self-start">
            <ExtAvatar src = {user?.avatar} size="sm" />
          </NavLink>

        <div className="grid gap-y-2">
          <div 
          onClick={(e) => {e.stopPropagation()}} 
          className="flex items-center gap-x-2 text-slate-400 relative"
          >
              <UserCard user={tweetUser} >
                  <NavLink 
                  to={`/${tweetUser.username}`} 
                  className="flex items-center w-fit gap-x-1 text-black !outline-none" href="/">
                    <span className={cn("font-bold hover:underline text-ellipsis text-nowrap max-w-[300px] overflow-hidden", {
                      // "underline": showUserCard
                    })}>
                      {tweetUser.name}
                    </span> 
                    { tweetUser.verified && <MdVerified className='text-twitter-blue'/>  }
                    { showUsername(tweetUser)} 
                  </NavLink>
              </UserCard>
               
                <span className='text-nowrap'>· { timeAgo(postState?.createdAt)} </span>
                {
                postState?.updatedAt &&
                <span className="text-sm font-medium italic">edited</span>
                }

                {
                  user.id === tweetUser.id && 
                  <Popover placement='top-end' offset={{ mainAxis: -20}}>
                    <PopoverHandler>
                      <Button variant='icon' size='icon-sm' className='text-slate-400 text-xs ml-auto'>
                        <FaEllipsis/>
                      </Button>
                    </PopoverHandler>
                    <PopoverContent className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden'>
                        <ul className='list-none text-sm'>
                          <span className='text-red-500 flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer'><RiDeleteBinLine/> Delete </span>
                        </ul>
                    </PopoverContent>
                  </Popover>
                }

                
          </div>

        
          <div className="text-justify break-words">
              { postState?.caption }
          </div>

          { 
          postState?.media && 
            <TweetMedia mediaType={postState?.media?.mediaType ?? 'image'} src={postState?.media?.src} alt="" />
          }

          <div className="flex items-center justify-between px-4 py-2">
            <TweetAction Icon={FaRegComment} actionCount={postState.replies} title="Reply" color="blue" onClick={handleReply}/>
            
            <div onClick={e => e.stopPropagation()}>
              <Popover placement='bottom-start' offset={{ mainAxis: -50}}>
                <PopoverHandler >
                  <div >
                    <PopoverContent  className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden'>
                        <ul className='list-none text-sm'>
                            <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap' onClick={handleRetweet}><FaRetweet/> { postState.retweeted ? 'Undo Repost':'Repost' } </li>
                            <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIQuote/> Quote</li>
                        </ul>
                    </PopoverContent>
                    <TweetAction Icon={FaRetweet} actionCount={postState.retweets} title="Retweet" color="green" isActive={postState.retweeted}/>
                  </div>
                </PopoverHandler>
              </Popover>
            </div>
            
            <TweetAction Icon={GoHeart} ActiveIcon={GoHeartFill} actionCount={postState.likes} title="Like" color="red" onClick={handleLike} isActive={postState.liked}/>

            <div className='flex'>
              <TweetAction Icon={FaRegBookmark} ActiveIcon={FaBookmark} title="Save" onClick={handleBookmark} isActive={postState.bookmarked}/>
              <TweetAction Icon={GoUpload} title="Share" onClick={handleShare}/>
            </div>

          </div>
      </div>
    </div>  

)}

// todo change naming to currentUser to avoid confusion
const Tweet = ({user, post, isLast, asMedia}) => {
  return (
    asMedia ? <TweetMiniMedia  user={user} post={post}/>
    : <BaseTweet tweetUser={user} post={post} isLast={isLast}/>

  )
}

export default Tweet