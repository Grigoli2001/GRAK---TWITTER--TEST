import { useEffect, useState, useContext, useReducer, forwardRef } from "react";
import ReactLoading from 'react-loading'
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import TweetMedia, { TweetMiniMedia } from "./TweetMedia";
import { ExtAvatar, UserCard } from "../User";
import { Button } from "../Button";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
// import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// axios
import instance, { baseURL } from '../../constants/axios';
import { tweetRequests } from '../../constants/requests';

// icons
import { GoHeart, GoHeartFill, GoUpload } from "react-icons/go";
import {
  FaRegComment,
  FaRetweet,
  FaRegBookmark,
  FaBookmark,
  FaEllipsis,
} from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { CIQuote } from "../customIcons";
import { RiDeleteBinLine } from "react-icons/ri";

import {
  showUsername,
  timeAgo,
  quantityFormat,
  tweetTime,
} from "../../utils/utils";
import { cn } from "../../utils/style";
import { TweetPoll } from "./Poll";
import { createToast } from "../../hooks/createToast";
import useUserContext from "../../hooks/useUserContext";
import { SocketContext } from "../../context/socketContext";
import { DefaultModal as BaseModal } from '../NavModal';
import { LuSparkles } from "react-icons/lu";
import { FiEdit } from "react-icons/fi";
import TweetCreate from "./TweetCreate";

export const TWEET_ACTIONS = {
  LIKE: "like",
  RETWEET: "retweet",
  REPLY: "reply",
  BOOKMARK: "bookmark",
  UPDATE_POLL: "update_poll",
  HIGHLIGHT: "highlight",
  EDIT: "edit"
};

export const TweetAction = ({
  Icon,
  ActiveIcon,
  actionCount,
  title,
  color,
  onClick,
  isActive,
  tooltip,
}) => {
  if (!ActiveIcon) ActiveIcon = Icon;
  // avoid tailwind purging
  const styles = {
    red: {
      text: `group-hover:text-red-500 ${isActive ? "text-red-500" : ""}`,
      bg: `group-hover:bg-red-100 `,
    },
    blue: {
      text: `group-hover:text-twitter-blue ${
        isActive ? "text-twitter-blue" : ""
      }`,
      bg: "group-hover:bg-twitter-blue/10",
    },
    green: {
      text: `group-hover:text-green-500  ${isActive ? "text-green-500" : ""}`,
      bg: "group-hover:bg-green-100",
    },
  };

  let style = styles[color] ?? styles.blue;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-center cursor-pointer`}
    >
      {/* For some reason Icon padding is removing icon */}
      <Button
        variant="icon"
        size="icon-sm"
        tooltip={tooltip}
        className={`text-black ${style.bg} ${style.text} transition-colors duration-100`}
      >
        {/* style has to applied directly on the button to ovverrife variant defaults */}
        {isActive ? <ActiveIcon /> : <Icon />}
      </Button>

      {/* use ternary to eval 0 */}
      {actionCount ? (
        <span className={`text-sm -ml-[6px] ${style.text}`}>
          {quantityFormat(actionCount)}
        </span>
      ) : null}

      <title>{title}</title>
    </div>
  );
};

function reducer(state, action) {
  const { payload } = action;
 
  
  switch (action.type) {
    case TWEET_ACTIONS.LIKE:

      return {...state, userLiked: payload.is_liked, totalLikes: state.totalLikes  + (payload.is_liked ? 1 : -1)}

    case TWEET_ACTIONS.RETWEET:
      return {...state,userRetweeted: payload?.data?.is_retweeted, totalRetweets: state.totalRetweets  + (payload?.data?.is_retweeted ? 1 : -1)}

      // case TWEET_ACTIONS.RETWEET:
    case TWEET_ACTIONS.REPLY:
      return {...state, replies: state.replies + 1}

    case TWEET_ACTIONS.BOOKMARK:
      if (payload.is_bookmarked) {
        createToast("Saved to bookmarks!", "success", "success-bookmark", {
          limit: 1,
        });
      }
      return {
        ...state,
        userBookmarked: payload.is_bookmarked,
        totalBookmarks: state.totalBookmarks + (payload.is_bookmarked ? 1 : -1),
      };

    case TWEET_ACTIONS.UPDATE_POLL:
      // client listens to all polls so filter out the poll that was updated
      if (state._id !== payload.newVote.tweet_id) {
        return state
      }

      console.log('poll update from redux', payload, state)
      let updateState = {}
      if (payload.iscurrentuser ) {
        updateState.userVoted = payload.newVote
      }
      
      return {...state,  totalVotes: payload.totalVotes, ...updateState, poll: { ...state.poll, options: state.poll.options.map(option => {
        if (option.id === payload.newVote.pollOption) {
          return {...option, votes: payload.interactionCount}
        }
        return option
      }
      )}
    
    }
      case TWEET_ACTIONS.HIGHLIGHT:
        return {...state, is_highlighted: payload.is_highlighted}

      case TWEET_ACTIONS.EDIT:
        return {...state, tweetText: payload.tweetText, is_edited: true}

    default:
      return state;
  }
}

const DelTweetModal = ({ open, setOpen, handleDeleteTweet}) => {

  return (
    <BaseModal
    open={open}
    handleBackClick={() => setOpen(false)}
    >
      <div className="p-4 bg-white rounded-xl max-w-[400px]">
        <h1 className="text-lg font-bold">Delete Tweet</h1>
        <p className="text-slate-400 mt-2">
          Are you sure you want to delete this tweet? This can't be undone.
        </p>
        <div className="flex justify-end gap-x-2 mt-4">
          <Button variant="outlined" size="sm" onClick={() => {setOpen(false)}}>
            Cancel
          </Button>
          <Button className="bg-red-500" size="sm" onClick={handleDeleteTweet}>
            Delete
          </Button>
        </div>
      </div>
    </BaseModal>
  )

}

export const BaseTweet = forwardRef(({ tweetUser, post, isLast, reply, fullView, asQuote}, ref) => {
  const [postState, dispatch] = useReducer(reducer, post)
  // const reducDispatch = useDispatch() 
  // console.log('post state IN base', postState?.tweetText, postState?.tweetType, postState?.userLiked)
  // const [postState, setPostState] = useState(post);
  const { user } = useUserContext()
  const { socket } = useContext(SocketContext);
  const [openDel, setOpenDel] = useState(false)
  const [retweetOpen, setRetweetOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()  

const LikeTweetMutation = useMutation({
  mutationFn: async ({ tweetId, willLike }) => {
    const response = await instance.post(tweetRequests.likeTweet, {
      tweetId: tweetId,
      willLike: willLike,
    });
    return response.data; // Assuming the response contains updated post data
  },

    onSuccess: (data) => {
       // if user liked the tweet, emit a notification possible types are like, retweet, comment, quote, follow, mention and reply
       if (data.is_liked ) {
        socket?.emit("notification:new", {
          tweetId: postState._id,
          triggeredByUserId: user.id,
          notificationType: "like",
        });
      }
      dispatch({ type: TWEET_ACTIONS.LIKE, payload: { ...data } });
      queryClient.invalidateQueries(['tweets', tweetRequests.forYou, { userId: user.id }]);
      queryClient.invalidateQueries(['tweets', tweetRequests.likes, { userId: user.id }]);
    },
    onError: (error) => {
      createToast('An error occurred while liking', 'error', 'error-like-tweet', { limit: 1 });
    },
    onSettled: () => {
     
    },
  }
);

const handleLike = (e) => {
  e.stopPropagation();
  LikeTweetMutation.mutate({
    tweetId: postState._id,
    willLike: !postState.userLiked,
  });
};

const RetweetMutation = useMutation({
  mutationFn: async ({ reference_id }) => {
    const response = await instance.post(tweetRequests.createTweets, {
      tweetType: 'retweet',
      reference_id: reference_id,
    });
    return response.data; 
  },
  onSuccess: (data) => {
    dispatch({ type: TWEET_ACTIONS.RETWEET, payload: { ...data } });
    if (data.is_retweeted) {
      socket?.emit("notification:new", {
        tweetId: postState._id,
        triggeredByUserId: user.id,
        notificationType: "retweet",
      });
      createToast('Keep it up!😁', 'success', 'success-retweet-tweet', { limit: 1 });
    }

      queryClient.invalidateQueries(['tweets', tweetRequests.forYou, { userId: user.id }]);
      queryClient.invalidateQueries(['tweets', tweetRequests.replies, { userId: user.id }] );
    
  },
  onError: (error) => {
    createToast('An error occurred while retweeting', 'error', 'error-retweet-tweet', { limit: 1 });
  },
  onSettled: () => {
    setRetweetOpen(false);
  },
});


  const handleRetweet = (e) => {
    e.stopPropagation();
    // console.log('retweet', postState )
    let resolvedState = postState
    if (postState.tweetType === 'retweet') {
      resolvedState = postState.reference
      if (resolvedState.tweetType === 'retweet') {
        createToast('You cannot retweet a retweet of a retweet', 'error', 'error-retweet-tweet', {limit: 1})
        setRetweetOpen(false)
        return
      }
    }

    const willRetweet = !postState.userRetweeted
    if (willRetweet) {
      // reference the tweet
      RetweetMutation.mutate({
        reference_id: resolvedState._id,
        willRetweet: !resolvedState.userRetweeted
      });
    }else{
    // otherwise delete the retweet by finding any retweet with the reference id by the current suer
    
      DeleteTweetMutation.mutate({ tweetId: resolvedState._id, action: 'undo-retweet'});
    }

  
}


    // instance.post(tweetRequests.createTweets, {
    //     tweetId: postState._id,
    //     tweetType: 'retweet',
    //     reference_id: postState._id,
    //     willRetweet: !postState.userRetweeted,
    // })
    // .then((res) => {
      // ASK AMAY: HOW
      // dispatch({ 
      //   type: TWEET_ACTIONS.RETWEET, 
      //   payload:{
      //     retweeted: res.data.retweeted, retweets: res.data.retweets 
      //   }
      // })

      // console.log('retweet res', res.data.tweet.userRetweeted, res.data)
      // queryClient.invalidateQueries(tweetRequests.forYou, {userId: user.id})
      // queryClient.invalidateQueries(tweetRequests.retweets, {userId: user.id})
      // if (res.data?.data?.is_retweeted) { 
      // createToast('Keep it up!😁', 'success', 'success-retweet-tweet', {limit: 1})
      // }
      // emit notification to to the reference user 
    // })
    // .catch((error) => {
    //   createToast('An error occured while retweeting' + error.message, 'error', 'error-retweet-tweet', {limit: 1})
    // })
    // .finally(() => setRetweetOpen(false))

  const DeleteTweetMutation = useMutation({
    mutationFn: async ({ tweetId, action }) => {
      const response = await instance.delete(tweetRequests.deleteTweet, {
        data: { tweetId: tweetId , action}
      });

      return response.data; 
    },
    onSuccess: (data) => {
    console.log('delete tweet', data)
      if (data?.tweetType === 'retweet') {
        createToast('Your retweet has been deleted', 'success', 'success-delete-tweet', {limit: 1})
        dispatch({ type: TWEET_ACTIONS.RETWEET, payload: { data : { is_retweeted: false } }});
        setRetweetOpen(false)
      }else {
      createToast('Your tweet has been deleted', 'success', 'success-delete-tweet', {limit: 1})
      }
      setOpenDel(false)

      queryClient.invalidateQueries(['tweets'])

    },
    onError: (error) => {
      createToast('An error occured while deleting tweet', 'error', 'error-delete-tweet', {limit: 1})
    },
    onSettled: () => {
      
    },
  }); 

  const handleDeleteTweet = async () => {
    DeleteTweetMutation.mutate({ tweetId: postState._id });
    // await instance.delete(tweetRequests.deleteTweet, {
    //   data: { tweetId: postState._id }
    // })
    // .then(res => {
    //   createToast('Your tweet has been deleted', 'success', 'success-delete-tweet', {limit: 1})
      // reducDispatch(removeFromTweets({categories:['forYou', 'media', 'likes', 'bookmarked'], tweet: postState}))
      // queryClient.invalidateQueries(tweetRequests.forYou, {userId: user.id})
      // queryClient.invalidateQueries(tweetRequests.likes, {userId: user.id})
      // queryClient.invalidateQueries(tweetRequests.retweets, {userId: user.id})
      // queryClient.invalidateQueries(tweetRequests.bookmarks, {userId: user.id})

    //   setOpenDel(false)
    // })
    // .catch(err => {
    //   createToast('An error occured while deleting tweet', 'error', 'error-delete-tweet', {limit: 1})
    // })
  }

  const handleReply = (e) => {
    e.stopPropagation();
    navigate(`/${tweetUser.username}/status/${postState._id}`)
  };

  const BookmarkMutation = useMutation({  
    mutationFn: async ({ tweetId, willBookmark, userId }) => {
      const response = await instance.post(tweetRequests.bookmarkTweet, {
        tweetId: tweetId,
        willBookmark: willBookmark,
        userId: userId
      });
      return response.data;
    },
    onSuccess: (data) => {
      dispatch({ type: TWEET_ACTIONS.BOOKMARK, payload: { ...data } });
    if (data.is_bookmarked) {
      createToast('Saved to bookmarks!', 'success', 'success-bookmark', { limit: 1 });
    }
      queryClient.invalidateQueries(['tweets', tweetRequests.bookmarks, { userId: user.id }]);
      queryClient.invalidateQueries(['tweets', tweetRequests.forYou, { userId: user.id }]);
    },
    onError: (error) => {

      createToast('An error occured while bookmarking', 'error', 'error-bookmark-tweet', { limit: 1 });
    },
    onSettled: () => {
    
    },
  });

  const handleBookmark = (e) => {
    e.stopPropagation();
    BookmarkMutation.mutate({ tweetId: postState._id, willBookmark: !postState.userBookmarked, userId: user.id });

    // e.stopPropagation();

    // instance.post(tweetRequests.bookmarkTweet, {
    //   tweetId: postState._id,
    //   willBookmark: !postState.userBookmarked,
    //   userId: user.id
    // })
    // .then((res) => {
    //   dispatch({type: TWEET_ACTIONS.BOOKMARK, payload: {...res.data}})
      // if (res.data.is_bookmarked){
      //   reducDispatch(addToTweets({categories:['bookmarked'], tweet: postState}))
      // }else {
      //   reducDispatch(removeFromTweets({categories:['bookmarked'], tweet: postState}))
      // }
      // queryClient.invalidateQueries(tweetRequests.bookmarks, {userId: user.id})

    // })
    // .catch((error) => {
    //   createToast('An error occured while bookmarking', 'error', 'error-bookmark-tweet', {limit: 1})
    // })
  };

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${baseURL}${tweetUser.username}/status/${postState._id}`)
    createToast('Link copied to clipboard', 'success', 'link-copied', {limit: 1})
  }

  const HighlightMutation = useMutation({
    mutationFn: async ({ tweetId, willHighlight }) => {
      const response = await instance.post(tweetRequests.highlightTweet, {
        tweetId: tweetId,
        willHighlight: willHighlight,
      });
      return response.data;
    },
    onSuccess: (data) => {
      dispatch({ type: TWEET_ACTIONS.HIGHLIGHT, payload: { ...data } });
      queryClient.invalidateQueries(['tweets', tweetRequests.highlights, { userId: user.id }]); 

    },
    onError: (error) => {
      createToast('An error occured while highlighting', 'error', 'error-add-to-highlights', { limit: 1 });
    },
    onSettled: () => {
    },
  });
  
    const handleHighlight = (e) => {
      e.stopPropagation();
      HighlightMutation.mutate({ tweetId: postState._id, willHighlight: !postState.is_highlighted });
      // e.stopPropagation();
      // instance.post(tweetRequests.highlightTweet, {
      //   tweetId: postState._id,
      //   willHighlight: !postState.is_highlighted,
      // })
      // .then((res) => {
      //   dispatch({type: TWEET_ACTIONS.HIGHLIGHT, payload: { ...res.data }})
      //   // if (res.data.is_highlighted){
      //   //   reducDispatch(addToTweets({categories:['highlights'], tweet: postState}))
      //   // }else {
      //   //   reducDispatch(removeFromTweets({categories:['highlights'], tweet: postState}))
      //   // }
      //   // queryClient.invalidateQueries(tweetRequests.highlights, {userId: user.id})
       
      // })
      // .catch((error) => {
      //   createToast('An error occured' + error.message, 'error', 'error-add-to-highlights', {limit: 1})
      // })
    }
  

  const navigate = useNavigate();

  const isValidMediaType = (contentType) => {
    if (contentType?.startsWith('image/')) {
        return 'image';
    } else if (contentType?.startsWith('video/')) {
        return 'video';
    } else {
        return null; // Invalid media type
    }
};

  // let base64String = '';
  // if (postState?.tweetMedia) {
  //   base64String = Buffer.from(postState?.tweetMedia?.data).toString('base64');
  // }

  if (editMode) {
    return (
      <TweetCreate editTweet={postState} editMode={editMode} setEditMode={setEditMode} dispatch={dispatch}/>
    )
  }

  return (


    
    // TWEET HEADER
    <div
      ref={ref}
      onClick={() => navigate(`/${tweetUser.username}/status/${post._id}`)}
      className={cn(
        "tweet w-full h-fit p-4 pb-0 grid grid-cols-[auto_1fr] hover:bg-gray-100 cursor-pointer",
        {
          "border-b border-b-solid border-gray-200": !isLast,
        }
      )}
    >
      {postState?.tweetType === "retweet" && (
        <span className="font-semibold gap-x-1 text-slate-400 inline-flex text-sm items-center pl-4 col-span-full">
          <FaRetweet /> {tweetUser.name} reposted
        </span>
      )}

      <NavLink
        onClick={(e) => e.stopPropagation()}
        to={`/${tweetUser.username}`}
        className="mr-4 mt-3 self-start"
      >
        <ExtAvatar src={tweetUser?.profile_pic} size="sm" />
      </NavLink>

      <div className="grid gap-y-2 relative">
        {reply && (
          <span className="absolute top-14 bg-slate-400 -left-9  h-[90%] w-[1px] "></span>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex items-center gap-x-2 text-slate-400 relative"
        >
          <UserCard user={tweetUser}>
            <NavLink
              to={`/${tweetUser.username}`}
              className="flex items-center w-fit gap-x-1 text-black !outline-none"
              href="/"
            >
              <span
                className={cn(
                  "font-bold hover:underline text-ellipsis text-nowrap max-w-[300px] overflow-hidden"
                )}
              >
                {tweetUser.name}
              </span>
              {tweetUser.verified && (
                <MdVerified className="text-twitter-blue" />
              )}
              {showUsername(tweetUser)}
            </NavLink>
          </UserCard>

          <span className="text-nowrap">
            · {timeAgo(postState?.createdAt)}
          </span>
          {postState?.is_edited && (
            <span className="text-sm font-medium italic">edited</span>
          )}

{/* tweet belongs to user */}
          {(user.id === tweetUser.id && !asQuote) && (
            <>
            <DelTweetModal open={openDel} setOpen={setOpenDel} tweetId={postState._id} handleDeleteTweet={handleDeleteTweet} />
            <Popover placement="top-end" offset={{ mainAxis: -20 }}>
              <PopoverHandler>
                <Button
                  variant="icon"
                  size="icon-sm"
                  className="text-slate-400 text-xs ml-auto"
                >
                  <FaEllipsis />
                </Button>
              </PopoverHandler>
              <PopoverContent className="!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden">
                <ul className="list-none text-sm">
                  { (!postState.poll || !postState.tweetType === 'retweet') &&
                  <li onClick={() => setEditMode(true)}className="flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                   <FiEdit /> Edit
                  </li>
                  }

                  {

                  (postState?.reference?.tweetType === 'deleted') ? null :
                  <li onClick={handleHighlight} className="flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                  {postState.is_highlighted ? 
                  
                  <><LuSparkles className="text-red-500"/>Remove from highlights</> : <><LuSparkles/>Add to highlights</>}
                  </li>

                  }
                  <li onClick={() => setOpenDel(true)} className="text-red-500 flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                    <RiDeleteBinLine /> Delete
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </>
          )}
        </div>
        {/* END TWEET HEADER */}

        {/* TWEET BODY */}

          <div className="text-justify break-all overflow-wrap">
            
              <p className={cn("text-wrap", {
                "font-bold line-through": postState?.reference?.tweetType === "deleted",
              })}>{ postState?.tweetType === 'retweet' ? postState.reference.tweetText : postState?.tweetText } </p>
          </div>
          { 
          // check if tweet has media or is a retweet and its ref has media
          (postState?.tweetMedia || (postState?.tweetType === 'retweet' && postState?.reference?.tweetMedia)) &&
            <TweetMedia mediaType={postState?.tweetMedia?.mimeType} src={postState?.tweetMedia?.src} alt="" />
          }
          {
            postState?.poll && 
            <TweetPoll postState={postState} dispatch={dispatch} />
          }

          {
            postState.tweetType ==='retweet' && postState?.reference.poll && 
            <TweetPoll postState={postState.reference} dispatch={dispatch} />
          }


          {
            postState?.tweetType === 'quote' &&
            <Tweet user={postState?.reference?.user} post={postState?.reference} asQuote={true}></Tweet>
          }
          {/* END TWEET BODY */}
        


        {/* TWEET FOOTER */}
          {
            fullView && 
              <div className="flex items-center justify-between p-1 text-slate-500 text-md">
              {tweetTime(postState?.createdAt)}
              {postState?.updatedAt && (
                  <span className="text-sm font-medium italic">edited</span>
              )}

          </div>
          }
        { // if tweet is a quote or a retweet of a deleted tweet, do not show the footer
          (asQuote  || (postState?.reference?.tweetType === 'deleted') ) ? null :

          <div className="flex items-center justify-between px-4 py-2">
            <TweetAction Icon={FaRegComment} actionCount={postState?.totalReplies} title="Reply" color="blue" onClick={handleReply}/>
            
             <Popover placement="bottom-start" offset={{mainAxis: -50}} open={retweetOpen} handler={setRetweetOpen}>
              <PopoverHandler onClick={(e) => e.stopPropagation()}>
                <div>
                  <TweetAction Icon={FaRetweet} actionCount={postState?.totalRetweets} title="Retweet" color="green" isActive={postState?.userRetweeted}/>
                </div>
              </PopoverHandler>
                <PopoverContent onClick={(e) => {e.stopPropagation()}}className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden'>
                    <ul className='list-none text-sm'>
                        <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap' onClick={handleRetweet}><FaRetweet/> { postState.userRetweeted ? 'Undo Repost':'Repost' } </li>
                        
                        {/* {postState?.tweetType !== 'quote' &&  */}
                        <NavLink to={'/compose/post'} state={{ postState: postState.tweetType ==='retweet' ? postState.reference : postState, replace: true }}>
                          <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIQuote/> Quote</li>
                        </NavLink>
                          {/* } */}
                    </ul>
                </PopoverContent>
            </Popover> 
            

          <TweetAction
            Icon={GoHeart}
            ActiveIcon={GoHeartFill}
            actionCount={postState?.totalLikes}
            title="Like"
            color="red"
            onClick={handleLike}
            isActive={postState?.userLiked}
          />

          <div className="flex">
            <TweetAction
              Icon={FaRegBookmark}
              actionCount={postState?.totalBookmarks}
              ActiveIcon={FaBookmark}
              title="Save"
              onClick={handleBookmark}
              isActive={postState?.userBookmarked}
            />
            <TweetAction Icon={GoUpload} title="Share" onClick={handleShare} />
          </div>
        </div>
        }      
      </div>
    </div>
    // END TWEET FOOTER
  );
}
);


export const FullTweet = ({ tweetId, isLast, parent }) => {
  const [tweetPost, setTweetPost] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()  
  const location = useLocation()
  const navigateTo404 = () => {
    navigate('/404', {replace: location.pathname})
  }

    useEffect(() => {
// AMAY FIX requests -> tweetRequests
        instance.get(tweetRequests.getTweetById + tweetId).then(res => {
            setTweetPost(res.data.data.tweet)
            // console.log('full tweet', res.data.data.tweet)
            setLoading(false)
        }).catch(err => {
            return navigateTo404()  
        })
        
    }, [tweetId])
    
    if(tweetPost.user === undefined) {
        return null
    }

    return loading ? (
        <div className='flex justify-center items-start h-[80vh] mt-4'>
          <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
        </div>
      ):(
        tweetPost?.user && 
        <>
        {tweetPost.reference_id ? <FullTweet key={tweetPost.reference_id} tweetId={tweetPost.reference_id} parent={true} /> : null }
        {parent ? 
        <BaseTweet tweetUser={tweetPost.user} post={tweetPost} reply={true}/>
        :
        <BaseTweet tweetUser={tweetPost.user} post={tweetPost} isLast={isLast} fullView={true}  />
}
        </>
    );
};


// todo change naming to currentUser to avoid confusion
export const Tweet = forwardRef(({ user, post, isLast, asMedia, tweetId, asQuote}, ref) => {

  // AMAY FIX: && !tweetId
  if (!user && !tweetId) return null;
  
  return  tweetId ? (
      <FullTweet ref={ref} tweetId={tweetId} isLast={isLast} />
    ) :
    asMedia ? (
      <TweetMiniMedia ref={ref} user={user} post={post} />
    ) : (
      <BaseTweet ref={ref} tweetUser={user} post={post} isLast={isLast} asQuote={asQuote}/>
  );
    })


export default Tweet;
