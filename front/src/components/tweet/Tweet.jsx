import { Buffer } from 'buffer';

import { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/testUserContext";
import TweetMedia, { TweetMiniMedia } from "./TweetMedia";
import { ExtAvatar, UserCard } from "../User";
import { Button } from "../Button";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import MiniDialog from "../MiniDialog";

// axios
import instance from '../../constants/axios';
import { requests } from '../../constants/requests';

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

// utils
import { showUsername, timeAgo, quantiyFormat } from "../../utils/utils";
import { cn } from "../../utils/style";

const TweetAction = ({
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
          {quantiyFormat(actionCount)}
        </span>
      ) : null}

      <title>{title}</title>
    </div>
  );
};


export const BaseTweet = ({ tweetUser, post, isLast, reply }) => {
  const [postState, setPostState] = useState(post);
  const { user } = useContext(UserContext);

  useEffect(() => {

    // postState?.tweet_likes.forEach(element => {
    //   if (element.userId === user.id) {
    //     setPostState(prev => ({...prev, liked: true, likes: postState.tweet_likes.length}))
    //   } else {
    //     setPostState(prev => ({...prev, liked: false, likes: postState.tweet_likes.length}))
    //   }
    // });

    // postState?.tweet_retweets.forEach(element => {
    //   if (element.userId === user.id) {
    //     setPostState(prev => ({...prev, retweeted: true, retweets: postState.tweet_retweets.length}))
    //   } else {
    //     setPostState(prev => ({...prev, retweeted: false, retweets: postState.tweet_retweets.length}))
    //   }
    // });

    // postState?.tweet_bookmarks.forEach(element => {
    //   if (element.userId === user.id) {
    //     setPostState(prev => ({...prev, bookmarked: true}))
    //   } else {
    //     setPostState(prev => ({...prev, bookmarked: false}))
    //   }
    // });
  }, [])

  const handleLike = (e) => {
    e.stopPropagation();
    // console.log("liked");
    setPostState((prev) => ({
      ...postState,
      liked: !postState.liked,
      likes: postState.liked ? postState.likes - 1 : postState.likes + 1,
    }));

    instance.post(requests.likeTweet, {
      tweetId: postState._id,
      userId: user.id
    })
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  const handleRetweet = () => {
    console.log('retweeted')
    setPostState({
      ...postState,
      retweeted: !postState.retweeted,
      retweets: postState.retweeted
        ? postState.retweets - 1
        : postState.retweets + 1,
    });

    instance.post(requests.retweetTweet, {
      tweetId: postState._id,
      userId: user.id
    })
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.log(error)
    })
  };

  const handleReply = (e) => {
    e.stopPropagation();
    console.log("replied");
  };

  const handleBookmark = (e) => {
    console.log("bookmarked");
    e.stopPropagation();
    setPostState({
      ...postState,
      bookmarked: !postState.bookmarked,
    });
    instance.post(requests.bookmarkTweet, {
      tweetId: postState._id,
      userId: user.id
    })
    .then((res) => {
      console.log(res)
    })
    .catch((error) => {
      console.log(error)
    })
  };

  const handleShare = (e) => {
    e.stopPropagation();
    console.log("shared");
  };

  const navigate = useNavigate();

  const isValidMediaType = (contentType) => {
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.startsWith('video/')) {
      return 'video';
    } else {
      return 'gif'; // Invalid media type
    }
  };

  let base64String = '';
  if (postState.tweetMedia) {
    base64String = Buffer.from(postState?.tweetMedia?.data).toString('base64');
  }

  return (
    // tweets for feed page, post is diff for single post view
    <div
      onClick={() => navigate(`/${tweetUser.username}/status/${post._id}`)}
      className={cn(
        "tweet w-full h-fit p-4 pb-0 grid grid-cols-[auto_1fr] hover:bg-gray-100 cursor-pointer",
        {
          "border-b border-b-solid border-gray-200": !isLast,
        }
      )}
    >
      <NavLink
        onClick={(e) => e.stopPropagation()}
        to={`/${tweetUser.username}`}
        className="mr-4 mt-3 self-start"
      >
        <ExtAvatar src={tweetUser?.avatar} size="sm" />

        
      </NavLink>

      <div className="grid gap-y-2 relative">
      {reply && (
          <span className="absolute top-14 bg-slate-400 -left-9  h-[90%] w-[1px] ">
          </span>
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
                  "font-bold hover:underline text-ellipsis text-nowrap max-w-[300px] overflow-hidden",
                  {
                    // "underline": showUserCard
                  }
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
            · {timeAgo(post?.createdAt)}{" "}
          </span>
          {post?.updatedAt && (
            <span className="text-sm font-medium italic">edited</span>
          )}

          {user.id === tweetUser.id && (
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
                  <span className="text-red-500 flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                    <RiDeleteBinLine /> Delete{" "}
                  </span>
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>

          <div className="text-justify break-words">
              { post?.tweetText }
          </div>

          { 
          post?.tweetMedia && 
            <TweetMedia mediaType={isValidMediaType(post?.tweetMedia?.contentType)} src={`data:${post?.tweetMedia?.contentType};base64,${base64String}`} alt="" />
          }

          <div className="flex items-center justify-between p-4">
            <TweetAction Icon={FaRegComment} actionCount={post?.tweet_comments} title="Reply" color="blue" onClick={handleReply}/>
            
            {/* <MiniDialog>
              <MiniDialog.Wrapper>
                <MiniDialog.Dialog className='absolute -left-2 right-0 w-fit bg-white rounded-xl shadow-all-round font-bold !outline-none z-10'>
                    <ul className='list-none text-sm'>
                        <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap' ><FaRetweet/> { postState.retweeted ? 'Undo Repost':'Repost' } </li>
                        <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIQuote/> Quote</li>
                    </ul>
                </MiniDialog.Dialog>
                <TweetAction Icon={FaRetweet} actionCount={postState?.retweets} title="Retweet" color="green" isActive={postState.retweeted}/>
              </MiniDialog.Wrapper>
            </MiniDialog> */}
            

            <TweetAction
              Icon={GoHeart}
              ActiveIcon={GoHeartFill}
              actionCount={postState.likes}
              title="Like"
              color="red"
              onClick={handleLike}
              isActive={postState.liked}
            />

            <div className="flex">
              <TweetAction
                Icon={FaRegBookmark}
                ActiveIcon={FaBookmark}
                title="Save"
                onClick={handleBookmark}
                isActive={postState.bookmarked}
              />
              <TweetAction Icon={GoUpload} title="Share" onClick={handleShare} />
            </div>
        </div>
      </div>
    </div>
  );
};

// todo change naming to currentUser to avoid confusion
const Tweet = ({ user, post, isLast, asMedia, complete }) => {
  
  return asMedia ? (
    <TweetMiniMedia user={user} post={post} complete={complete}/>
  ) : (
    <BaseTweet tweetUser={user} post={post} isLast={isLast} complete={complete}/>
  );
};

export default Tweet;
