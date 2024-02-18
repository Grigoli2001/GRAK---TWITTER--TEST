import { useEffect, useState, useContext, useReducer } from "react";
import ReactLoading from "react-loading";
import { NavLink, useNavigate } from "react-router-dom";
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
import instance, { baseURL } from "../../constants/axios";
import { requests } from "../../constants/requests";

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

export const TWEET_ACTIONS = {
  LIKE: "like",
  RETWEET: "retweet",
  REPLY: "reply",
  BOOKMARK: "bookmark",
  UPDATE_POLL: "update_poll",
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
      return {
        ...state,
        userLiked: payload.is_liked,
        totalLikes: state.totalLikes + (payload.is_liked ? 1 : -1),
      };

    case TWEET_ACTIONS.RETWEET:
      return {
        ...state,
        retweeted: payload.retweeted,
        retweets: payload.retweets,
      };

    case TWEET_ACTIONS.REPLY:
      return { ...state, replies: payload.replies };

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
      // option the votes for the option
      return {
        ...state,
        totalVotes: payload.totalVotes,
        userVoted: payload.userVoted,
        poll: {
          ...state.poll,
          options: state.poll.options.map((option) => {
            if (option.id === payload.option) {
              console.log("match");
              console.log("payload ", payload.interactionCount);
              return { ...option, votes: payload.interactionCount };
            }
            return option;
          }),
        },
      };

    default:
      return state;
  }
}

export const BaseTweet = ({ tweetUser, post, isLast, reply, fullView }) => {
  const [postState, dispatch] = useReducer(reducer, post);
  console.log(
    "post state IN base",
    postState?.tweetText,
    postState?.tweetType,
    postState?.userLiked
  );
  // const [postState, setPostState] = useState(post);
  const { user } = useUserContext();
  const { socket } = useContext(SocketContext);

  const handleLike = (e) => {
    e.stopPropagation();
    instance
      .post(requests.likeTweet, {
        tweetId: postState._id,
        isLiked: postState.userLiked,
      })
      .then((res) => {
        console.log(res.data);
        // if user liked the tweet, emit a notification possible types are like, retweet, comment, quote, follow, mention and reply
        if (!postState.userLiked) {
          socket?.emit("notification:new", {
            tweetId: postState._id,
            triggeredByUserId: user.id,
            notificationType: "like",
          });
        }
        dispatch({ type: TWEET_ACTIONS.LIKE, payload: { ...res.data } });
      })
      .catch((error) => {
        createToast("An error occured", "error", "error-like-tweet", {
          limit: 1,
        });
      });
  };

  const handleRetweet = () => {
    console.log("retweeted");

    instance
      .post(requests.retweetTweet, {
        tweetId: postState._id,
      })
      .then((res) => {
        // if user retweeted the tweet, emit a notification
        socket?.emit("notification:new", {
          tweetId: postState._id,
          triggeredByUserId: user.id,
          notificationType: "retweet",
        });
        dispatch({
          type: TWEET_ACTIONS.RETWEET,
          payload: {
            retweeted: res.data.retweeted,
            retweets: res.data.retweets,
          },
        });
      })
      .catch((error) => {
        createToast("An error occured", "error", "error-retweet-tweet", {
          limit: 1,
        });
      });
  };

  const handleReply = (e) => {
    e.stopPropagation();
    // TODO open popup for reply
    navigate(`/${tweetUser.username}/status/${postState._id}`);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();

    instance
      .post(requests.bookmarkTweet, {
        tweetId: postState._id,
        isBookmarked: postState.userBookmarked,
      })
      .then((res) => {
        dispatch({ type: TWEET_ACTIONS.BOOKMARK, payload: { ...res.data } });
      })
      .catch((error) => {
        createToast(
          "An error occured while bookmarking",
          "error",
          "error-bookmark-tweet",
          { limit: 1 }
        );
      });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${baseURL}${tweetUser.username}/status/${postState._id}`
    );
    createToast("Link copied to clipboard", "success", "link-copied", {
      limit: 1,
    });
  };

  const navigate = useNavigate();

  //   const isValidMediaType = (contentType) => {
  //     if (contentType.startsWith('image/')) {
  //         return 'image';
  //     } else if (contentType.startsWith('video/')) {
  //         return 'video';
  //     } else {
  //         return null; // Invalid media type
  //     }
  // };

  // let base64String = '';
  // if (postState?.tweetMedia) {
  //   base64String = Buffer.from(postState?.tweetMedia?.data).toString('base64');
  // }

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

          <span className="text-nowrap">· {timeAgo(postState?.createdAt)}</span>
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
                  <li className="p-2 flex items-center hover:bg-gray-100 cursor-pointer">
                    Edit
                  </li>
                  <li className="text-red-500 flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                    <RiDeleteBinLine /> Delete
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="text-justify break-all overflow-wrap">
          <p className="text-wrap">{postState?.tweetText} </p>
        </div>
        {post?.tweetMedia && (
          <TweetMedia src={`${postState.tweetMedia}`} alt="" />
        )}
        {postState?.poll && (
          <TweetPoll postState={postState} dispatch={dispatch} />
        )}

        {fullView && (
          <div className="flex items-center justify-between p-1 text-slate-500 text-md">
            {tweetTime(postState?.createdAt)}
            {postState?.updatedAt && (
              <span className="text-sm font-medium italic">edited</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-2">
          <TweetAction
            Icon={FaRegComment}
            actionCount={postState?.totalReplies}
            title="Reply"
            color="blue"
            onClick={handleReply}
          />

          <MiniDialog>
            <MiniDialog.Wrapper>
              <MiniDialog.Dialog className="absolute -left-2 right-0 w-fit bg-white rounded-xl shadow-all-round font-bold !outline-none z-10">
                <ul className="list-none text-sm">
                  <li
                    className="hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    onClick={handleRetweet}
                  >
                    <FaRetweet />{" "}
                    {postState.userRetweeted ? "Undo Repost" : "Repost"}{" "}
                  </li>
                  <li className="hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap">
                    <CIQuote /> Quote
                  </li>
                </ul>
              </MiniDialog.Dialog>
              <TweetAction
                Icon={FaRetweet}
                actionCount={postState?.totalRetweets}
                title="Retweet"
                color="green"
                isActive={postState?.userRetweeted}
              />
            </MiniDialog.Wrapper>
          </MiniDialog>

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
      </div>
    </div>
  );
};

export const FullTweet = ({ tweetId, isLast, parent }) => {
  const [tweetPost, setTweetPost] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instance
      .get(requests.getTweetById + tweetId)
      .then((res) => {
        setTweetPost(res.data.data.tweet);
        console.log("full tweet", res.data.data.tweet);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [tweetId]);

  if (tweetPost.user === undefined) {
    return null;
  }

  return loading ? (
    <div className="flex justify-center items-start h-[80vh] mt-4">
      <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
    </div>
  ) : (
    tweetPost?.user && (
      <>
        {tweetPost.reference_id ? (
          <FullTweet tweetId={tweetPost.reference_id} parent={true} />
        ) : null}
        {parent ? (
          <BaseTweet tweetUser={tweetPost.user} post={tweetPost} reply={true} />
        ) : (
          <BaseTweet
            tweetUser={tweetPost.user}
            post={tweetPost}
            isLast={isLast}
            fullView={true}
          />
        )}
      </>
    )
  );
};

// todo change naming to currentUser to avoid confusion
export const Tweet = ({ user, post, isLast, asMedia, tweetId }) => {
  if (!user) return null;

  return tweetId ? (
    <FullTweet tweetId={tweetId} isLast={isLast} />
  ) : asMedia ? (
    <TweetMiniMedia user={user} post={post} />
  ) : (
    <BaseTweet tweetUser={user} post={post} isLast={isLast} />
  );
};

export default Tweet;
